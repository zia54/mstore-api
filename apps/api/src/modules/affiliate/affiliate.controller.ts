import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AffiliateService } from './affiliate.service';

@ApiTags('Affiliate Partners')
@Controller('affiliate')
export class AffiliateController {
  constructor(private readonly affiliateService: AffiliateService) {}

  @Post('join')
  join(@Body() body: { email: string; referralCode: string }) {
    return this.affiliateService.registerAffiliate(body.email, body.referralCode);
  }

  @Get('stats/:code')
  stats(@Param('code') code: string) {
    return this.affiliateService.getStats(code);
  }
}
