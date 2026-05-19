import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

import * as firebaseConfig from '../firebase/firebase-config.json';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private _firestore!: admin.firestore.Firestore;

  onModuleInit() {
    if (admin.apps.length === 0) {
      // Clonamos el objeto para evitar que sea de solo lectura (read-only)
      // debido a cómo TypeScript/Node maneja las importaciones de JSON.
      const serviceAccount = JSON.parse(JSON.stringify(firebaseConfig)) as admin.ServiceAccount;

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
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
