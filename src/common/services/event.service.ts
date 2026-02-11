import { Injectable } from '@nestjs/common';
import { Subject, Observable, interval } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class EventService {
  // 创建一个Subject，用来广播事件
  private eventSubject = new Subject<any>();

  // 发送一个事件
  emit(message: string) {
    this.eventSubject.next(message);
  }

  // 获取事件流的Observable
  getEvent(): Observable<string> {
    return this.eventSubject.asObservable(); // 返回为Observable，外部只能订阅，不能发送事件
  }

  // 生成一个定时推送的Observable
  generateTimedMessage(): Observable<string> {
    return interval(1000).pipe(
      map((count) => `这是第 ${count + 1}条信息`),
      tap((message) => {
        console.log('生成定时事件:', message);
      }),
    );
  }
}
