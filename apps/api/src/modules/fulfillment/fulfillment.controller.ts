import { Controller, Get, Patch, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FulfillmentService } from './fulfillment.service';

@ApiTags('Fulfillment & Ledger')
@Controller('fulfillment')
export class FulfillmentController {
  constructor(private readonly fulfillmentService: FulfillmentService) {}

  @Get('seller/sub-orders')
  getSellerSubOrders() {
    return this.fulfillmentService.getSellerSubOrders();
  }

  @Patch('sub-orders/:id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; trackingNumber?: string },
  ) {
    return this.fulfillmentService.updateSubOrderStatus(id, body.status, body.trackingNumber);
  }

  @Get('track/:orderNumber')
  trackOrder(@Param('orderNumber') orderNumber: string) {
    return this.fulfillmentService.trackOrderByNumber(orderNumber);
  }

  @Get('admin/ledger')
  getLedger() {
    return this.fulfillmentService.getAccountingLedger();
  }
}
