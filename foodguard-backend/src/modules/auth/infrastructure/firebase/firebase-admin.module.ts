import { Module, Global } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');

@Global()
@Module({})
export class FirebaseAdminModule {
  static forRoot() {
    if (!admin.apps.length) {
      try {
        if (fs.existsSync(serviceAccountPath)) {
          const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
          console.log('✅ Firebase Admin SDK initialized successfully');
        } else {
          console.warn('⚠️  firebase-service-account.json not found — phone verification disabled');
        }
      } catch (err: any) {
        console.error('❌ Firebase Admin init failed:', err.message);
      }
    }
    return { module: FirebaseAdminModule };
  }
}
