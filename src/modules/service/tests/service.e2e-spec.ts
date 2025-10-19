import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { testDatabaseModule } from '@core/database/testDatabase';
import { seed } from '@core/database/seedData';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { UserModule } from '@modules/user/user.module';
import { AuthModule } from '@modules/auth/auth.module';
import { ServiceModule } from '../service.module';
import { CreateServiceDtoFactory, UpdateServiceDtoFactory } from './factories';
import { EmailModule } from '@modules/email/email.module';

describe('ServiceController (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        testDatabaseModule,
        UserModule,
        AuthModule,
        EmailModule,
        ServiceModule,
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();
    await seed();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });
  beforeEach(async () => {
    const data = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user@example.com',
        password: 'Passw0rd',
      })
      .expect(200);

    token = data.body.token;
  });
  it('/services (POST)', async () => {
    const createServiceDto = CreateServiceDtoFactory();
    const response = await request(app.getHttpServer())
      .post('/services')
      .send(createServiceDto)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
    expect(response.body).toStrictEqual({
      ...createServiceDto,
      id: expect.any(Number),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    return;
  });
  it('/services (GET)', async () => {
    return request(app.getHttpServer())
      .get('/services')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
  it('/services/:id (GET)', async () => {
    const createServiceDto = CreateServiceDtoFactory();
    const { body: service } = await request(app.getHttpServer())
      .post('/services')
      .send(createServiceDto)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
    const response = await request(app.getHttpServer())
      .get(`/services/${service.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toMatchObject({
      ...createServiceDto,
      id: expect.any(Number),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    return;
  });
  it('/services/:id (PATCH)', async () => {
    const createServiceDto = CreateServiceDtoFactory();
    const { body: service } = await request(app.getHttpServer())
      .post('/services')
      .send(createServiceDto)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const updateServiceDto = UpdateServiceDtoFactory();
    const response = await request(app.getHttpServer())
      .patch(`/services/${service.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateServiceDto)
      .expect(200);
    expect(response.body).toMatchObject({
      ...updateServiceDto,
      id: expect.any(Number),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    return;
  });
  it('/services/:id (DELETE)', async () => {
    const createServiceDto = CreateServiceDtoFactory();
    const { body: service } = await request(app.getHttpServer())
      .post('/services')
      .send(createServiceDto)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
    return request(app.getHttpServer())
      .delete(`/services/${service.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
  });

  afterAll(async () => {
    await app.close();
  });
});
