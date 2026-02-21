import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StsService {
  constructor(private configService: ConfigService) {}

  async getStsToken() {
    const accessKeyId = this.configService.get('OSS_ACCESS_KEY_ID');
    const accessKeySecret = this.configService.get('OSS_ACCESS_KEY_SECRET');
    console.log('STS Token - accessKeyId:', accessKeyId);
    console.log('STS Token - accessKeySecret:', accessKeySecret ? '***' : 'undefined');

    return {
      accessKeyId,
      accessKeySecret,
      securityToken: '',
      expiration: new Date(Date.now() + 3600000).toISOString(),
      bucket: this.configService.get('OSS_BUCKET'),
      region: this.configService.get('OSS_REGION'),
    };
  }
}
