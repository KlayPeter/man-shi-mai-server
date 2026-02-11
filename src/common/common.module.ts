import { Module } from '@nestjs/common';
import { EventService } from './services/event.service';

@Module({
  providers: [EventService],
  exports: [EventService], // 导出服务以便在其他模块中使用
})
export class CommonModule {}
