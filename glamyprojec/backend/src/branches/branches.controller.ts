import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Delete,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  create(@Body() createBranchDto: CreateBranchDto) {
    return this.branchesService.create(createBranchDto);
  }

  // La URL será: GET /branches?tenantId=ID_DE_LA_EMPRESA
  @Get()
  findAll(@Query('tenantId') tenantId: string) {
    return this.branchesService.findAll(tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.branchesService.remove(id);
  }
}
