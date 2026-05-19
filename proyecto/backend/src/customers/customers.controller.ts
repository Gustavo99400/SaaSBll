import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

// La ruta base será http://localhost:3000/customers
@Controller('customers')
export class CustomersController {
  // Inyectamos el servicio que creamos en el paso anterior
  constructor(private readonly customersService: CustomersService) {}

  // Endpoint para crear un cliente (POST /customers)
  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    // El decorador @Body() extrae el JSON que enviamos en la petición
    // y lo tipa automáticamente con nuestro CreateCustomerDto
    return this.customersService.create(createCustomerDto);
  }

  // Endpoint para listar clientes (GET /customers?tenantId=...)
  @Get()
  findAll(@Query('tenantId') tenantId?: string) {
    return this.customersService.findAll(tenantId);
  }
}
