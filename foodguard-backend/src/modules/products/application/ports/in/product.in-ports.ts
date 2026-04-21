import { Product } from '../../../domain/entities/product.entity';
import { CreateProductDto } from '../../../infrastructure/dtos/create-product.dto';
import { FindNearbyProductsDto } from '../../../infrastructure/dtos/find-nearby-products.dto';
import { UpdateProductDto } from '../../../infrastructure/dtos/update-product.dto';
import { PaginatedResponseDto } from '../../../../../shared/dtos/paginated-response.dto';

export const IProductService = Symbol('IProductService');

export interface IProductService {
  createProduct(
    dto: CreateProductDto,
    userId: string,
    file: Express.Multer.File,
  ): Promise<Product>;

  findNearbyProducts(
    dto: FindNearbyProductsDto,
  ): Promise<PaginatedResponseDto<Product>>;

  getMyProducts(donorId: string): Promise<Product[]>;

  getProductById(productId: string): Promise<Product>;

  updateProduct(
    productId: string,
    dto: UpdateProductDto,
    userId: string,
  ): Promise<Product>;

  deleteProduct(productId: string, userId: string): Promise<void>;
}
