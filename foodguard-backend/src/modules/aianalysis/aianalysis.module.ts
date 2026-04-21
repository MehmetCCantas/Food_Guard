import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { IAiAnalysisService } from './application/ports/in/aianalysis.in-ports';
import { IAiApiProvider } from './application/ports/out/aianalysis.out-ports';
import { AiAnalysisService } from './application/services/aianalysis.service';
import { AnalyzeFoodSafetyUseCase } from './application/use-cases/analyze-food-safety.use-case';
import { GeminiAdapter } from './infrastructure/adapters/gemini.adapter';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [],
  providers: [
    AnalyzeFoodSafetyUseCase,
    {
      provide: IAiAnalysisService,
      useClass: AiAnalysisService,
    },
    {
      provide: IAiApiProvider,
      useClass: GeminiAdapter,
    },
  ],
  exports: [IAiAnalysisService],
})
export class AiAnalysisModule {}
