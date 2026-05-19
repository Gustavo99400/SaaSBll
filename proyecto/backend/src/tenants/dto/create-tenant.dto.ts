import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsIn,
  Length,
  Matches,
} from 'class-validator';

export class CreateTenantDto {
  @IsString({ message: 'El nombre debe ser un texto válido' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  readonly name!: string;

  @IsString()
  @IsNotEmpty({ message: 'El RUC es obligatorio' })
  @Length(11, 11, { message: 'El RUC debe tener exactamente 11 dígitos' })
  @Matches(/^[0-9]+$/, { message: 'El RUC solo debe contener números' })
  readonly taxId!: string;

  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  @IsNotEmpty({ message: 'El correo de contacto es obligatorio' })
  readonly contactEmail!: string;

  // --- NUEVOS CAMPOS DEL SAAS ---

  @IsOptional()
  @IsString()
  @IsIn(['STARTUP', 'PRO', 'ENTERPRISE'], {
    message: 'El plan debe ser STARTUP, PRO o ENTERPRISE',
  })
  readonly plan?: 'STARTUP' | 'PRO' | 'ENTERPRISE';

  @IsOptional()
  @IsString()
  @IsIn(['ACTIVE', 'SUSPENDED'], {
    message: 'El estado solo puede ser ACTIVE o SUSPENDED',
  })
  readonly status?: 'ACTIVE' | 'SUSPENDED';
}
