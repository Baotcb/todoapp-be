import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import * as cookieParser from 'cookie-parser';

(BigInt.prototype as any).toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Todo API')
    .setDescription('Tài liệu API hệ thống quản lý công việc (Todo App)')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.use(
    '/reference',
    apiReference({
      content: document,
      theme: 'bluePlanet',
    }),
  );
  app.use(cookieParser());
  const configService = app.get(ConfigService);
  const clientUrl = configService.get<string>('ClientSettingsUrl');
  app.enableCors({
    origin: clientUrl,
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
