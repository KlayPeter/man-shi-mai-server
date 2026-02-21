import { Controller, Get, UseGuards } from '@nestjs/common';
import { StsService } from './sts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResponseUtil } from '../common/utils/response.util';

@Controller('sts')
export class StsController {
  constructor(private readonly stsService: StsService) {}

  @Get('getStsToken')
  @UseGuards(JwtAuthGuard)
  async getStsToken() {
    const token = await this.stsService.getStsToken();
    return ResponseUtil.success(token, '获取成功');
  }
}
