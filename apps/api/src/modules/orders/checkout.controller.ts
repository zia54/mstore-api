import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CheckoutService } from './checkout.service';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Orders')
@Controller('orders')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService, private readonly prisma: PrismaService) {}

  @Post('checkout')
  checkout(@Body() body: any) {
    return this.checkoutService.createOrder(body);
  }

  @Get('customer/:customerId')
  getCustomerOrders(@Param('customerId') customerId: string) {
    return this.prisma.order.findMany({
      where: { customerId },
      include: { subOrders: { include: { items: true, seller: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('admin/all')
  getAllOrders() {
    return this.prisma.order.findMany({
      include: { customer: { select: { fullName: true, email: true } }, subOrders: { include: { items: true, seller: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
