import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No se proporcionó un token de autorización');
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    if (!token) {
      throw new UnauthorizedException('Formato de token inválido');
    }

    try {
      // Verificamos el token con Firebase Admin SDK
      const decodedToken = await this.firebaseService.auth.verifyIdToken(token);
      
      // Adjuntamos el usuario decodificado a la petición
      // Esto contendrá los Custom Claims (tenantId, role, etc.)
      request['user'] = decodedToken;
      
      return true;
    } catch (error) {
      console.error('Error verificando token:', error);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
