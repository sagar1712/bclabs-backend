import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import * as path from 'path';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
    {
      cors: true,
      logger: ['error', 'warn', 'debug', 'log'],
    },
  );
  const configService = new ConfigService();

  // Set up Swagger
  setupSwagger(app);

  app.setBaseViewsDir(path.join(__dirname, '..', 'templates'));
  app.setViewEngine('ejs');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      dismissDefaultMessages: false,
      validationError: {
        target: false,
      },
    }),
  );

  // Start the application
  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  // Display a clickable Swagger URL
  const serverUrl = `http://localhost:${port}`;
  const swaggerUrl = `${serverUrl}/documentation`;

  console.log(`\nServer running at: \x1b[36m${serverUrl}\x1b[0m`);
  console.log(
    `Swagger documentation available at: \x1b[32m${swaggerUrl}\x1b[0m\n`,
  );
}

bootstrap();
