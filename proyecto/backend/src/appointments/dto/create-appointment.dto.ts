export class CreateAppointmentDto {
  readonly customerId!: string;
  readonly serviceId!: string;
  readonly staffId!: string;
  readonly date!: string; // ISO string
  readonly status!: string; // PENDING, CONFIRMED, CANCELLED
  readonly tenantId!: string;
  readonly branchId!: string;
}
