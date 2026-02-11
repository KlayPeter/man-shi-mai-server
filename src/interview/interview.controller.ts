import { Controller, Get, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { EventService } from '../common/services/event.service';
import { map } from 'rxjs/operators';

@Controller('interview')
export class InterviewController {
  constructor(private readonly eventService: EventService) {}

  // SSE接口，返回一个Observable，前端可以订阅这个接口来接收服务器发送的事件，实时推送信息
  @Sse('stream')
  stream(): Observable<MessageEvent> {
    // 调用EventService中的方法生成定时推送的Observable
    return this.eventService.generateTimedMessage().pipe(
      map(
        (message) =>
          ({
            data: JSON.stringify({
              timestamp: new Date().toISOString(),
              message,
            }),
          }) as MessageEvent,
      ),
    );
  }
}
