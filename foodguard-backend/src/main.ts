import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { winstonLogger } from './shared/logger/winston.config';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import * as express from 'express';

// ─── Firebase Admin SDK init ──────────────────────────────
const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
if (!admin.apps.length) {
  try {
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      console.log('✅ Firebase Admin SDK initialized');
    } else {
      console.warn('⚠️  firebase-service-account.json not found');
    }
  } catch (e: any) {
    console.error('❌ Firebase Admin init error:', e.message);
  }
}


// ─── PostGIS Extension Bootstrap ──────────────────────────
async function ensurePostgisExtension() {
  const { Client } = await import('pg');
  const dbUrl = process.env.DB_URL || process.env.DATABASE_URL;
  const pgHost = process.env.PGHOST;
  const isInternal = pgHost?.includes('railway.internal') || dbUrl?.includes('railway.internal');

  const clientConfig: any = dbUrl
    ? { connectionString: dbUrl, ssl: isInternal ? false : { rejectUnauthorized: false } }
    : {
        host: pgHost || 'localhost',
        port: parseInt(process.env.PGPORT || '5432'),
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || '',
        database: process.env.PGDATABASE || 'railway',
        ssl: isInternal ? false : false,
      };

  const client = new Client(clientConfig);
  try {
    await client.connect();
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    console.log('✅ PostGIS extension enabled');
    await client.end();
  } catch (e: any) {
    console.warn('⚠️  PostGIS extension could not be enabled:', e.message);
    try { await client.end(); } catch {}
  }
}

async function bootstrap() {
  await ensurePostgisExtension();

  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
  });

  app.setGlobalPrefix('api/v1');

  // ─── Static file serving for uploaded images ──────────────
  const uploadsPath = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });
  app.use('/uploads', express.static(uploadsPath));

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'validator.swagger.io'],
        },
      },
    }),
  );

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 1000,
      standardHeaders: true,
      legacyHeaders: false,
      message:
        'Çok fazla istek gönderdiniz, lütfen 15 dakika sonra tekrar deneyin.',
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalInterceptors(new LoggingInterceptor());

  const config = new DocumentBuilder()
    .setTitle('FoodGuard API')
    .setDescription('Gıda İsrafını Önleme Platformu Backend API Dokümantasyonu')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  winstonLogger.log(`Uygulama ${port} portunda çalışmaya başladı.`);
  winstonLogger.log(`API Dokümantasyonu: http://localhost:${port}/api-docs`);
}
bootstrap();
