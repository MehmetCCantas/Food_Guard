import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AiAnalysisModule } from '../aianalysis/aianalysis.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { IProductService } from './application/ports/in/product.in-ports';
import { IProductRepository } from './application/ports/out/product.out-ports';
import { ProductService } from './application/services/product.service';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { FindNearbyProductsUseCase } from './application/use-cases/find-nearby-products.use-case';
import { GetProductByIdUseCase } from './application/use-cases/get-product-by-id.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from './application/use-cases/delete-product.use-case';

import { ProductController } from './infrastructure/controllers/product.controller';
import { ProductOrmEntity } from './infrastructure/repositories/product.orm-entity';
import { ProductRepository } from './infrastructure/repositories/product.repository';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([ProductOrmEntity]),
    AiAnalysisModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [ProductController],
  providers: [
    CreateProductUseCase,
    FindNearbyProductsUseCase,
    GetProductByIdUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    {
      provide: IProductService,
      useClass: ProductService,
    },
    {
      provide: IProductRepository,
      useClass: ProductRepository,
    },
  ],
  exports: [IProductRepository],
})
export class ProductModule {}
