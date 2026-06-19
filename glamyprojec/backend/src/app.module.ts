import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomersModule } from './customers/customers.module';
import { ServicesModule } from './services/services.module';
import { StaffModule } from './staff/staff.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { TenantsModule } from './tenants/tenants.module';
import { BranchesModule } from './branches/branches.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [CustomersModule, ServicesModule, StaffModule, AppointmentsModule, TenantsModule, BranchesModule, AuditLogModule, FirebaseModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
