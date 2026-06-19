export class CreateAppointmentDto {
  readonly customerId?: string;
  readonly serviceId?: string;
  readonly staffId?: string;
  readonly date!: string; // ISO string
  readonly status!: string; // PENDING, CONFIRMED, CANCELLED
  readonly tenantId!: string;
  readonly branchId?: string;

  // Nested structures (Opcionales para soportar tanto plano como anidado)
  readonly customer?: {
    readonly id?: string;
    readonly name: string;
    readonly email: string;
    readonly phone: string;
  };

  readonly branch?: {
    readonly id: string;
    readonly name: string;
    readonly address: string;
    readonly phone: string;
  };

  readonly service?: {
    readonly id: string;
    readonly name: string;
    readonly price: number;
    readonly durationInMinutes: number;
  };

  readonly staff?: {
    readonly id: string;
    readonly name: string;
    readonly role: string;
  };
}
