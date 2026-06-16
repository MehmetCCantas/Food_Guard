import {
  Inject,
  Injectable,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Product } from '../../domain/entities/product.entity';
import { ProductStatus } from '../../domain/enums/product.enum';
import { CreateProductDto } from '../../infrastructure/dtos/create-product.dto';
import { IProductRepository } from '../ports/out/product.out-ports';
import { IAiAnalysisService } from '../../../aianalysis/application/ports/in/aianalysis.in-ports';
import { AiAnalysisRequestDto } from '../../../aianalysis/infrastructure/dtos/ai-analysis-request.dto';
import { CloudinaryService } from '../../../../shared/cloudinary/cloudinary.service';
import * as fs from 'fs';
import { promisify } from 'util';
import { extname, join } from 'path';

const writeFileAsync = promisify(fs.writeFile);

@Injectable()
export class CreateProductUseCase {
  private readonly logger = new Logger(CreateProductUseCase.name);

  constructor(
    @Inject(IProductRepository)
    private readonly productRepository: IProductRepository,
    @Inject(IAiAnalysisService)
    private readonly aiAnalysisService: IAiAnalysisService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(
    dto: CreateProductDto,
    userId: string,
    file: Express.Multer.File,
  ): Promise<Product> {
    const photoBase64 = file.buffer.toString('base64');

    const aiRequest = new AiAnalysisRequestDto();
    aiRequest.photoBase64 = photoBase64;
    aiRequest.photoMimeType = file.mimetype;
    aiRequest.storageCondition = dto.storageCondition;
    aiRequest.storageDurationHours = dto.storageDurationHours;
    aiRequest.hasSmellChange = dto.hasSmellChange;

    let aiReport: Awaited<ReturnType<typeof this.aiAnalysisService.analyzeFoodSafety>>;
    try {
      aiReport = await this.aiAnalysisService.analyzeFoodSafety(aiRequest);
    } catch (err) {
      this.logger?.warn?.('AI analysis failed, using fallback report: ' + err?.message);
      aiReport = {
        foodIdentity: 'Unknown (AI Unavailable)',
        riskLevel: 'Low',
        confidenceScore: 0,
        warningForRecipient: null,
        recommendationToDonor: null,
        analysisNotes: 'AI analysis could not be completed.',
      } as any;
    }

    if (aiReport.riskLevel === 'High') {
      throw new ForbiddenException(
        `AI Analizi Reddedildi: ${aiReport.recommendationToDonor}`,
      );
    }

    // Try Cloudinary first, fallback to local disk
    let imageUrl: string;
    try {
      const cloudinaryUrl = await this.cloudinaryService.uploadBuffer(file.buffer, file.mimetype, 'foodguard/products');
      if (cloudinaryUrl) {
        imageUrl = cloudinaryUrl;
        this.logger.log(`☁️ Image uploaded to Cloudinary: ${cloudinaryUrl}`);
      } else {
        throw new Error('Cloudinary not configured');
      }
    } catch (err) {
      this.logger.warn('Cloudinary upload failed, falling back to local disk: ' + err?.message);
      const fileExtension = extname(file.originalname);
      const newFilename = `${uuidv4()}${fileExtension}`;
      const uploadPath = './uploads/products';
      const filePath = join(uploadPath, newFilename);
      imageUrl = `/uploads/products/${newFilename}`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      try {
        await writeFileAsync(filePath, file.buffer);
      } catch (error) {
        throw new InternalServerErrorException('Failed to save image');
      }
    }

    const newProduct = new Product();
    newProduct.id = uuidv4();
    newProduct.donorId = userId;
    newProduct.title = dto.title;
    newProduct.description = dto.description;
    newProduct.category = dto.category;
    newProduct.imageUrl = imageUrl;
    newProduct.city = dto.city;
    newProduct.district = dto.district;
    newProduct.status = ProductStatus.AVAILABLE;
    newProduct.createdAt = new Date();
    newProduct.warningMessage = aiReport.warningForRecipient;
    newProduct.latitude = dto.latitude;
    newProduct.longitude = dto.longitude;

    return this.productRepository.save(newProduct);
  }
}
