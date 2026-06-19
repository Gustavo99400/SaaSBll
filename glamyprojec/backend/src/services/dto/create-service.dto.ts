export class CreateServiceDto {
  readonly name!: string;
  readonly description!: string;
  readonly price!: number;
  readonly durationInMinutes!: number;
  readonly tenantId!: string;
}
