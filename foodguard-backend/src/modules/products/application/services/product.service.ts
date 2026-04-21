import { Injectable, Inject } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity';
import { CreateProductDto } from '../../infrastructure/dtos/create-product.dto';
import { FindNearbyProductsDto } from '../../infrastructure/dtos/find-nearby-products.dto';
import { UpdateProductDto } from '../../infrastructure/dtos/update-product.dto';
import { IProductService } from '../ports/in/product.in-ports';
import { IProductRepository } from '../ports/out/product.out-ports';
import { CreateProductUseCase } from '../use-cases/create-product.use-case';
import { FindNearbyProductsUseCase } from '../use-cases/find-nearby-products.use-case';
import { GetProductByIdUseCase } from '../use-cases/get-product-by-id.use-case';
import { UpdateProductUseCase } from '../use-cases/update-product.use-case';
import { DeleteProductUseCase } from '../use-cases/delete-product.use-case';
import { PaginatedResponseDto } from '../../../../shared/dtos/paginated-response.dto';

@Injectable()
export class ProductService implements IProductService {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly findNearbyProductsUseCase: FindNearbyProductsUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
    @Inject(IProductRepository)
    private readonly productRepository: IProductRepository,
  ) {}

  async createProduct(
    dto: CreateProductDto,
    userId: string,
    file: Express.Multer.File,
  ): Promise<Product> {
    return this.createProductUseCase.execute(dto, userId, file);
  }

  async findNearbyProducts(
    dto: FindNearbyProductsDto,
  ): Promise<PaginatedResponseDto<Product>> {
    return this.findNearbyProductsUseCase.execute(dto);
  }

  async getMyProducts(donorId: string): Promise<Product[]> {
    return this.productRepository.findByDonorId(donorId);
  }

  async getProductById(productId: string): Promise<Product> {
    return this.getProductByIdUseCase.execute(productId);
  }

  async updateProduct(
    productId: string,
    dto: UpdateProductDto,
    userId: string,
  ): Promise<Product> {
    return this.updateProductUseCase.execute(productId, dto, userId);
  }

  async deleteProduct(productId: string, userId: string): Promise<void> {
    return this.deleteProductUseCase.execute(productId, userId);
  }
}
