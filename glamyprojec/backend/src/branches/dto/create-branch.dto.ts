import { IsString, IsNotEmpty } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  @IsNotEmpty({
    message: 'El tenantId es obligatorio para vincular la sucursal',
  })
  readonly tenantId!: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre de la sede es obligatorio' })
  readonly name!: string;

  @IsString()
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  readonly address!: string;

  @IsString()
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  readonly phone!: string;
}
