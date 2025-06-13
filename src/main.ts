import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as https from 'https';

async function bootstrap() {
  // HTTPS 옵션 설정
  const httpsOptions = {
    key: fs.readFileSync('./121.167.129.36-key.pem'),
    cert: fs.readFileSync('./121.167.129.36.pem'),
  };

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
    httpsOptions,
  });

  app.enableVersioning({
    type: VersioningType.URI,
    // defaultVersion: '1',
  });

  const config = new DocumentBuilder()
    .setTitle('Stream Chat Monitor API')
    .setDescription('Stream Chat Monitor API description')
    .setVersion('1.0')
    .addTag('queue')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('apis', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      // Disable error messages in production
      transform: true,
      disableErrorMessages: process.env.NODE_ENV === 'dev' ? false : true,
    }),
  );

  // Bull Board 설정
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  const audioQueue = app.get('BullQueue_audio-processing');
  const whisperQueue = app.get('BullQueue_whisper-processing');

  const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
    queues: [new BullAdapter(audioQueue), new BullAdapter(whisperQueue)],
    serverAdapter,
  });

  // 큐 등록
  setQueues([new BullAdapter(audioQueue), new BullAdapter(whisperQueue)]);

  // 미들웨어 추가
  app.use('/admin/queues', serverAdapter.getRouter());

  // 정적 파일 제공
  app.useStaticAssets(
    join(__dirname, '..', 'node_modules/@bull-board/ui/dist'),
  );

  const port = process.env.IS_BATCH ? 3001 : 3000;
  await app.listen(port);
  console.log(`Application is running on: https://localhost:${port}`);
}
bootstrap();
