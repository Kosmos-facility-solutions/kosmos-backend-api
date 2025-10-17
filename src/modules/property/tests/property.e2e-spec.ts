import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { testDatabaseModule } from '@core/database/testDatabase';
import { seed } from '@core/database/seedData';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { UserModule } from '@modules/user/user.module';
import { AuthModule } from '@modules/auth/auth.module';
import { PropertyModule } from '../property.module';
import {
  CreatePropertyDtoFactory,
  UpdatePropertyDtoFactory,
} from './factories';
import { EmailModule } from '@modules/email/email.module';
import { User } from '@modules/user/entities/user.entity';

describe('PropertyController (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let user: Partial<User>;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        testDatabaseModule,
        UserModule,
        AuthModule,
        EmailModule,
        PropertyModule,
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
    user = data.body.user;
    token = data.body.token;
  });
  it('/propertys (POST)', async () => {
    const createPropertyDto = CreatePropertyDtoFactory();
    const response = await request(app.getHttpServer())
      .post('/propertys')
      .send(createPropertyDto)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
    expect(response.body).toStrictEqual({
      ...createPropertyDto,
      id: expect.any(Number),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      userId: user.id,
    });
    return;
  });
  it('/propertys (GET)', async () => {
    return request(app.getHttpServer())
      .get('/propertys')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
  it('/propertys/:id (GET)', async () => {
    const createPropertyDto = CreatePropertyDtoFactory();
    const { body: property } = await request(app.getHttpServer())
      .post('/propertys')
      .send(createPropertyDto)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
    const response = await request(app.getHttpServer())
      .get(`/propertys/${property.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toMatchObject({
      ...createPropertyDto,
      id: expect.any(Number),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      userId: user.id,
    });
    return;
  });
  it('/propertys/:id (PATCH)', async () => {
    const createPropertyDto = CreatePropertyDtoFactory();
    const { body: property } = await request(app.getHttpServer())
      .post('/propertys')
      .send(createPropertyDto)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const updatePropertyDto = UpdatePropertyDtoFactory();
    const response = await request(app.getHttpServer())
      .patch(`/propertys/${property.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatePropertyDto)
      .expect(200);
    expect(response.body).toMatchObject({
      ...updatePropertyDto,
      id: expect.any(Number),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      userId: user.id,
    });
    return;
  });
  it('/propertys/:id (DELETE)', async () => {
    const createPropertyDto = CreatePropertyDtoFactory();
    const { body: property } = await request(app.getHttpServer())
      .post('/propertys')
      .send(createPropertyDto)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
    return request(app.getHttpServer())
      .delete(`/propertys/${property.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
  });

  afterAll(async () => {
    await app.close();
  });
});
