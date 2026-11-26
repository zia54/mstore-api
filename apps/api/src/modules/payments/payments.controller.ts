import { Controller, Post, Patch, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('Payments (EasyPaisa / JazzCash / Raast)')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('submit-proof')
  submitProof(
    @Body() body: { orderNumber: string; method: string; transactionId: string; senderAccount: string },
  ) {
    return this.paymentsService.submitPaymentProof(
      body.orderNumber,
      body.method,
      body.transactionId,
      body.senderAccount,
    );
  }

  @Patch('admin/verify/:orderId')
  verify(@Param('orderId') orderId: string, @Body() body: { approved: boolean }) {
    return this.paymentsService.verifyPayment(orderId, body.approved);
  }
}
