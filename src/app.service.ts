import { Injectable } from '@nestjs/common';
import { Chzzk } from 'chzzk-z';

@Injectable()
export class AppService {
  getHello(): string {
    const chzzk = new Chzzk();
    chzzk.addMessage('Hello Chzzk!');
    chzzk.addMessage('Hello Npm!');
    return chzzk.getMessages();
  }
}
