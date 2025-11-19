import { PaginatedDto } from '@common/dto/paginated.dto';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import expressBasicAuth from 'express-basic-auth';
import helmet from 'helmet';
import * as morgan from 'morgan';
import { AppModule } from './app.module';
import { config } from './config';
import { Logger } from './core/logger/Logger';

//MAIN
async function bootstrap() {
  const logger: Logger = new Logger();
  const app = await NestFactory.create(AppModule, {
    logger,
    rawBody: true,
  });

  //SECURITY
  app.use(helmet());

  //API ROUTES PREFIX
  app.setGlobalPrefix(config.urls.apiRoot);

  //VERSIONING
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  //CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  //MORGAN REQUEST LOGS
  app.use(
    morgan.default(
      ':remote-addr :remote-user :method :url HTTP/:http-version  :status :res[content-length] - :response-time ms',
      {
        stream: {
          write: (message) => {
            new Logger('Morgan').http(message.trim());
          },
        },
      },
    ),
  );

  //SWAGGER auth
  if (config.swagger.hasAuth) {
    const basicAuthMiddleware = expressBasicAuth({
      users: {
        [`${config.swagger.username}`]: config.swagger.password,
      },
      challenge: true,
    });
    //UI swagger view
    app.use(`/${config.swagger.route}`, basicAuthMiddleware);
    //JSON swagger view
    app.use(`/${config.swagger.route}-json`, basicAuthMiddleware);
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle(`${config.app.name}`)
    .setDescription(`The ${config.app.name} API description`)
    .setVersion('1.0')
    .addServer(
      `${config.urls.protocol}://${config.urls.url}${
        config.urls.port.length ? ':' : ''
      }${config.urls.port}${config.urls.apiRoot}`,
    )
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    extraModels: [PaginatedDto],
  });
  SwaggerModule.setup(`${config.swagger.route}`, app, document);

  //VALIDATION
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        exposeDefaultValues: true,
      },
      validateCustomDecorators: true, //https://docs.nestjs.com/custom-decorators
    }),
  );

  app.enableShutdownHooks();
  const port = process.env.PORT || config.server.port;
  await app.listen(port);
  logger.info(`Server started at port ${port}`);
}
bootstrap();
