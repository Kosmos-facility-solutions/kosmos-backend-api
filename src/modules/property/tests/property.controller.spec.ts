import { Test, TestingModule } from '@nestjs/testing';
import { PropertyController } from '../property.controller';
import { PropertyService } from '../property.service';
import {
  CreatePropertyDtoFactory,
  PropertyFactory,
  UpdatePropertyDtoFactory,
} from './factories';
import { Property } from '../entities/property.entity';
import { testDatabaseModule } from '@core/database/testDatabase';
import { SequelizeModule } from '@nestjs/sequelize';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { UpdatePropertyDto } from '../dto/update-property.dto';
import { JwtService } from '@nestjs/jwt';

describe('Property Controller', () => {
  let controller: PropertyController, service: PropertyService;
  const createTestingModule = async () => {
    const mockPropertyService = {
      findOne: async () => {},
      findAll: async () => {},
      create: jest.fn(async (dto: CreatePropertyDto) => {
        return Property.build({
          id: Math.round(Math.random() * (1000 - 1) + 1),
          ...dto,
        });
      }),
      update: jest.fn(async (id: number, dto: UpdatePropertyDto) => {
        return Property.build({
          id: id,
          ...dto,
        });
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [testDatabaseModule, SequelizeModule.forFeature([Property])],
      controllers: [PropertyController],
      providers: [PropertyService, JwtService],
    })
      .overrideProvider(PropertyService)
      .useValue(mockPropertyService)
      .compile();

    return module;
  };

  beforeAll(async () => {
    const module = await createTestingModule();
    controller = module.get<PropertyController>(PropertyController);
    service = module.get<PropertyService>(PropertyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a property', async () => {
    const mockedProperty: Property = PropertyFactory();
    jest.spyOn(service, 'findOne').mockImplementation(
      jest.fn(async (id) => {
        mockedProperty.id = id;
        return mockedProperty;
      }),
    );
    expect(await controller.findOne(mockedProperty.id)).toStrictEqual(
      mockedProperty,
    );
  });

  it('should return an array of propertys', async () => {
    const mockedPropertys = PropertyFactory(10);
    jest.spyOn(service, 'findAll').mockImplementation(
      jest.fn(async () => {
        return { count: 10, limit: 10, offset: 0, data: mockedPropertys };
      }),
    );
    expect(await controller.findAll()).toStrictEqual({
      count: 10,
      limit: 10,
      offset: 0,
      data: mockedPropertys,
    });
  });

  it('should create a property', async () => {
    const createPropertyDto: CreatePropertyDto = CreatePropertyDtoFactory();
    expect(await controller.create(createPropertyDto)).toMatchObject({
      id: expect.any(Number),
      ...createPropertyDto,
    });
  });

  it('should update a property', async () => {
    const updatePropertyDto: UpdatePropertyDto = UpdatePropertyDtoFactory();
    const id = 1;
    expect(await controller.update(id, updatePropertyDto)).toMatchObject({
      id,
      ...updatePropertyDto,
    });
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();
  });
});
