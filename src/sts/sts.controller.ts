import { Controller, Get, UseGuards } from '@nestjs/common';
import { StsService } from './sts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResponseUtil } from '../common/utils/response.util';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('STS令牌')
@ApiBearerAuth()
@Controller('sts')
export class StsController {
  constructor(private readonly stsService: StsService) {}

  @Get('getStsToken')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取STS临时凭证' })
  async getStsToken() {
    const token = await this.stsService.getStsToken();
    return ResponseUtil.success(token, '获取成功');
  }
}
