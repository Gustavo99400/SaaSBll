import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private _firestore!: admin.firestore.Firestore;

  onModuleInit() {
    if (admin.apps.length === 0) {
      if (process.env.FIREBASE_CONFIG || process.env.FUNCTIONS_EMULATOR) {
        // En producción (Cloud Functions) se inicializa de forma segura usando las credenciales por defecto de Google
        admin.initializeApp();
      } else {
        // En desarrollo local, se carga el archivo de credenciales de forma dinámica
        try {
          const serviceAccount = require('../firebase/firebase-config.json');
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
        } catch (error) {
          console.warn(
            'Advertencia: No se pudo cargar firebase-config.json localmente, intentando inicialización por defecto.',
            error,
          );
          admin.initializeApp();
        }
      }
    }
    this._firestore = admin.firestore();
  }

  get firestore() {
    return this._firestore;
  }

  get auth(): admin.auth.Auth {
    return admin.auth();
  }
}
