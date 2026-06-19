import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

const { generateSecret, verify } = require('otplib');

@Injectable()
export class AuthService {
  constructor(private readonly firebaseService: FirebaseService) {}

  // Genera un secreto para un usuario (SuperAdmin)
  async generate2FASecret(uid: string, email: string) {
    const secret = generateSecret();
    
    // Generamos la URL para el código QR (otpauth://...) manualmente
    const otpauthUrl = `otpauth://totp/Glamy%20SaaS:${email}?secret=${secret}&issuer=Glamy%20SaaS`;

    // Guardamos el secreto en Firestore para este usuario
    await this.firebaseService.firestore
      .collection('admin_secrets')
      .doc(uid)
      .set({
        twoFactorSecret: secret,
        updatedAt: new Date().toISOString(),
      });

    return {
      secret,
      otpauthUrl, // Esto se usa para generar el código QR en el frontend
    };
  }

  // Verifica el código de 6 dígitos
  async verify2FACode(uid: string, code: string): Promise<boolean> {
    // Buscamos el secreto en Firestore
    const doc = await this.firebaseService.firestore
      .collection('admin_secrets')
      .doc(uid)
      .get();

    if (!doc.exists) {
      throw new UnauthorizedException('No se ha configurado 2FA para este usuario.');
    }

    const { twoFactorSecret } = doc.data() as { twoFactorSecret: string };

    // Verificamos el código con otplib usando la función verify (asíncrona)
    const isValid = await verify({
      token: code,
      secret: twoFactorSecret,
    });

    return isValid;
  }
}
