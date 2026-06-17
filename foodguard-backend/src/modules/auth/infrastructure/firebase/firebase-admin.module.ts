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
        // 1) Try JSON file first (local dev)
        if (fs.existsSync(serviceAccountPath)) {
          const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
          console.log('✅ Firebase Admin SDK initialized from file');
        }
        // 2) Try env var (Railway production)
        else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
          const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
          console.log('✅ Firebase Admin SDK initialized from env var');
        } else {
          console.warn('⚠️  Firebase credentials not found — phone verification disabled');
        }
      } catch (err: any) {
        console.error('❌ Firebase Admin init failed:', err.message);
      }
    }
    return { module: FirebaseAdminModule };
  }
}
