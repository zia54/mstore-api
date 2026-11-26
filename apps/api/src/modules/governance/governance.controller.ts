import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GovernanceService } from './governance.service';

@ApiTags('Governance & Reviews')
@Controller('governance')
export class GovernanceController {
  constructor(private readonly governanceService: GovernanceService) {}

  @Get('sellers')
  getSellers() {
    return this.governanceService.listSellers();
  }

  @Patch('sellers/:id/kyc')
  updateKyc(@Param('id') id: string, @Body() body: { kycStatus: 'APPROVED' | 'REJECTED' }) {
    return this.governanceService.approveSeller(id, body.kycStatus);
  }

  @Post('reviews')
  createReview(@Body() body: { productId: string; customerName: string; rating: number; comment: string }) {
    return this.governanceService.addProductReview(body.productId, body.customerName, body.rating, body.comment);
  }

  @Get('reviews/:productId')
  getReviews(@Param('productId') productId: string) {
    return this.governanceService.getProductReviews(productId);
  }
}
