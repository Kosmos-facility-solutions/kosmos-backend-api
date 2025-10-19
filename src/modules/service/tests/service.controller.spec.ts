import { Test, TestingModule } from '@nestjs/testing';
import { ServiceController } from '../service.controller';
import { ServiceService } from '../service.service';
import {
  CreateServiceDtoFactory,
  ServiceFactory,
  UpdateServiceDtoFactory,
} from './factories';
import { Service } from '../entities/service.entity';
import { testDatabaseModule } from '@core/database/testDatabase';
import { SequelizeModule } from '@nestjs/sequelize';
import { CreateServiceDto } from '../dto/create-service.dto';
import { UpdateServiceDto } from '../dto/update-service.dto';
import { JwtService } from '@nestjs/jwt';

describe('Service Controller', () => {
  let controller: ServiceController, service: ServiceService;
  const createTestingModule = async () => {
    const mockServiceService = {
      findOne: async () => {},
      findAll: async () => {},
      create: jest.fn(async (dto: CreateServiceDto) => {
        return Service.build({
          id: Math.round(Math.random() * (1000 - 1) + 1),
          ...dto,
        });
      }),
      update: jest.fn(async (id: number, dto: UpdateServiceDto) => {
        return Service.build({
          id: id,
          ...dto,
        });
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [testDatabaseModule, SequelizeModule.forFeature([Service])],
      controllers: [ServiceController],
      providers: [ServiceService, JwtService],
    })
      .overrideProvider(ServiceService)
      .useValue(mockServiceService)
      .compile();

    return module;
  };

  beforeAll(async () => {
    const module = await createTestingModule();
    controller = module.get<ServiceController>(ServiceController);
    service = module.get<ServiceService>(ServiceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a service', async () => {
    const mockedService: Service = ServiceFactory();
    jest.spyOn(service, 'findOne').mockImplementation(
      jest.fn(async (id) => {
        mockedService.id = id;
        return mockedService;
      }),
    );
    expect(await controller.findOne(mockedService.id)).toStrictEqual(
      mockedService,
    );
  });

  it('should return an array of services', async () => {
    const mockedServices = ServiceFactory(10);
    jest.spyOn(service, 'findAll').mockImplementation(
      jest.fn(async () => {
        return { count: 10, limit: 10, offset: 0, data: mockedServices };
      }),
    );
    expect(await controller.findAll()).toStrictEqual({
      count: 10,
      limit: 10,
      offset: 0,
      data: mockedServices,
    });
  });

  it('should create a service', async () => {
    const createServiceDto: CreateServiceDto = CreateServiceDtoFactory();
    expect(await controller.create(createServiceDto)).toMatchObject({
      id: expect.any(Number),
      ...createServiceDto,
    });
  });

  it('should update a service', async () => {
    const updateServiceDto: UpdateServiceDto = UpdateServiceDtoFactory();
    const id = 1;
    expect(await controller.update(id, updateServiceDto)).toMatchObject({
      id,
      ...updateServiceDto,
    });
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();
  });
});
