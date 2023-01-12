import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const serviceName = configService.get<string>('APP_NAME');
  const logger = new Logger(serviceName);
  const title = configService.get<string>('PROJECT_NAME') + ' - ' + serviceName;
  logger.log(title);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: true,
      transform: true,
      validateCustomDecorators: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
  });

  const configSwagger = new DocumentBuilder()
    .setTitle('KezBek Solution - Microservice Loyalty')
    .setDescription(
      'API Documentation for Microservice Loyalty of KezBek Solution',
    )
    .setContact('Sugeng Winanjuar', null, 'winanjuar@gmail.com')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const configCustomSwagger: SwaggerCustomOptions = {
    customSiteTitle: 'KezBek Solution',
    swaggerOptions: { docExpansion: 'none' },
  };

  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('apidoc', app, document, configCustomSwagger);

  const port = configService.get<number>('APP_PORT');
  await app.listen(port);
  logger.log(`Service is running on port ${port}`);

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL')],
      queue: configService.get<string>('RABBITMQ_QUEUE_LOYALTY'),
      queueOptions: { durable: false },
      prefetchCount: 1,
    },
  });
  await app.startAllMicroservices();
  logger.log(`${serviceName} is listening queue from RabbitMQ`);
}
bootstrap();
