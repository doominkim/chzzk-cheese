import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
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

  await app.listen(3001);
}
bootstrap();
