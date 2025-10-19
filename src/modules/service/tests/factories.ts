import { faker } from '@faker-js/faker';
import { Service } from '../entities/service.entity';
import _ from 'lodash';
import { CreateServiceDto } from '../dto/create-service.dto';
import { plainToClass } from 'class-transformer';
import { UpdateServiceDto } from '../dto/update-service.dto';

const createRandomService = (): Service => {
  return new Service({
    id: faker.number.int(),
    name: faker.company.name(),
  });
};

export function ServiceFactory(count: number): Service[];
export function ServiceFactory(count?: number): Service;
export function ServiceFactory(count: number): Service[] | Service {
  if (!_.isNil(count) && _.isNumber(count)) {
    return faker.helpers.multiple(createRandomService, { count });
  }
  return createRandomService();
}

const createRandomCreateServiceDto = (): CreateServiceDto => {
  return plainToClass(CreateServiceDto, {
    name: faker.company.name(),
  });
};

export function CreateServiceDtoFactory(count: number): CreateServiceDto[];
export function CreateServiceDtoFactory(count?: number): CreateServiceDto;
export function CreateServiceDtoFactory(
  count: number,
): CreateServiceDto[] | CreateServiceDto {
  if (!_.isNil(count) && _.isNumber(count)) {
    return faker.helpers.multiple(createRandomCreateServiceDto, { count });
  }
  return createRandomCreateServiceDto();
}

const createRandomUpdateServiceDto = (): UpdateServiceDto => {
  return plainToClass(UpdateServiceDto, {
    name: faker.company.name(),
  });
};

export function UpdateServiceDtoFactory(count: number): UpdateServiceDto[];
export function UpdateServiceDtoFactory(count?: number): UpdateServiceDto;
export function UpdateServiceDtoFactory(
  count: number,
): UpdateServiceDto[] | UpdateServiceDto {
  if (!_.isNil(count) && _.isNumber(count)) {
    return faker.helpers.multiple(createRandomUpdateServiceDto, { count });
  }
  return createRandomUpdateServiceDto();
}
