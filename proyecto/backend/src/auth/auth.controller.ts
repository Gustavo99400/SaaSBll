import { Controller, Post, UseGuards, Req, Body, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { FirebaseService } from '../firebase/firebase.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly authService: AuthService
  ) {}

  @Post('password-changed')
  @UseGuards(AuthGuard)
  async passwordChanged(@Req() req: any) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    const uid = user.uid;
    const role = user.role;
    const tenantId = user.tenantId;

    await this.firebaseService.auth.setCustomUserClaims(uid, {
      role: role,
      tenantId: tenantId,
      requiresPasswordChange: false,
    });

    return { success: true, message: 'Estado de contraseña actualizado' };
  }

  @Post('2fa/generate')
  @UseGuards(AuthGuard)
  async generate2FA(@Req() req: any) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.authService.generate2FASecret(user.uid, user.email);
  }

  @Post('2fa/verify')
  @UseGuards(AuthGuard)
  async verify2FA(@Req() req: any, @Body('code') code: string) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    const isValid = await this.authService.verify2FACode(user.uid, code);

    if (!isValid) {
      throw new UnauthorizedException('Código 2FA inválido');
    }

    return { success: true, message: 'Código 2FA verificado con éxito' };
  }
}
