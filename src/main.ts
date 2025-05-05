import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bull';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  app.setGlobalPrefix('/api');

  const config = new DocumentBuilder()
    .setTitle('Chzzk API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('apis', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      // Disable error messages in production
      disableErrorMessages: process.env.NODE_ENV === 'dev' ? false : true,
    }),
  );

  // Bull Board 설정
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
    queues: [],
    serverAdapter: serverAdapter,
  });

  // 큐 등록
  const messageQueue = app.get('BullQueue_message-queue');
  setQueues([new BullAdapter(messageQueue)]);

  // 미들웨어 추가
  app.use('/admin/queues', serverAdapter.getRouter());

  // 정적 파일 제공
  app.useStaticAssets(
    join(__dirname, '..', 'node_modules/@bull-board/ui/dist'),
  );

  await app.listen(3000);
}
bootstrap();
