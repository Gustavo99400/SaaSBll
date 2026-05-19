export class CreateAuditLogDto {
  readonly action!: string; // Ej: "CREATE_APPOINTMENT", "DELETE_CUSTOMER"
  readonly entity!: string; // Ej: "appointments", "customers"
  readonly entityId!: string; // El ID del documento afectado
  readonly performedBy!: string; // El ID del usuario/staff que hizo la acción
  readonly details?: string; // (Opcional) Un texto extra con detalles
}
