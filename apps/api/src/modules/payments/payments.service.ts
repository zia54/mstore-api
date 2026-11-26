import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async submitPaymentProof(orderNumber: string, method: string, transactionId: string, senderAccount: string) {
    if (!transactionId || !senderAccount) {
      throw new BadRequestException('Transaction ID and Sender Mobile/IBAN are required');
    }

    const order = await this.prisma.order.findUnique({
      where: { orderNumber: orderNumber.trim().toUpperCase() },
    });
    if (!order) throw new NotFoundException('Order not found');

    await this.prisma.auditLog.create({
      data: {
        actorRole: 'CUSTOMER',
        action: 'PAYMENT_PROOF_SUBMITTED',
        targetType: 'ORDER',
        targetId: order.id,
        metadata: JSON.stringify({ method, transactionId, senderAccount, status: 'PENDING_VERIFICATION' }),
      },
    });

    return this.prisma.order.update({
      where: { id: order.id },
      data: {
        paymentMethod: `${method} (TID: ${transactionId})`,
        status: 'PAYMENT_VERIFICATION_PENDING',
      },
    });
  }

  async verifyPayment(orderId: string, approved: boolean) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: approved ? 'PAID_CONFIRMED' : 'PAYMENT_REJECTED',
      },
    });
  }
}
