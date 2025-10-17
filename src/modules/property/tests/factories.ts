import { faker } from '@faker-js/faker';
import { Property } from '../entities/property.entity';
import _ from 'lodash';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { plainToClass } from 'class-transformer';
import { UpdatePropertyDto } from '../dto/update-property.dto';

const createRandomProperty = (): Property => {
  return new Property({
    id: faker.number.int(),
    name: faker.company.name(),
    userId: faker.number.int(),
  });
};

export function PropertyFactory(count: number): Property[];
export function PropertyFactory(count?: number): Property;
export function PropertyFactory(count: number): Property[] | Property {
  if (!_.isNil(count) && _.isNumber(count)) {
    return faker.helpers.multiple(createRandomProperty, { count });
  }
  return createRandomProperty();
}

const createRandomCreatePropertyDto = (): CreatePropertyDto => {
  return plainToClass(CreatePropertyDto, {
    name: faker.company.name(),
    userId: faker.number.int(),
  });
};

export function CreatePropertyDtoFactory(count: number): CreatePropertyDto[];
export function CreatePropertyDtoFactory(count?: number): CreatePropertyDto;
export function CreatePropertyDtoFactory(
  count: number,
): CreatePropertyDto[] | CreatePropertyDto {
  if (!_.isNil(count) && _.isNumber(count)) {
    return faker.helpers.multiple(createRandomCreatePropertyDto, { count });
  }
  return createRandomCreatePropertyDto();
}

const createRandomUpdatePropertyDto = (): UpdatePropertyDto => {
  return plainToClass(UpdatePropertyDto, {
    name: faker.company.name(),
  });
};

export function UpdatePropertyDtoFactory(count: number): UpdatePropertyDto[];
export function UpdatePropertyDtoFactory(count?: number): UpdatePropertyDto;
export function UpdatePropertyDtoFactory(
  count: number,
): UpdatePropertyDto[] | UpdatePropertyDto {
  if (!_.isNil(count) && _.isNumber(count)) {
    return faker.helpers.multiple(createRandomUpdatePropertyDto, { count });
  }
  return createRandomUpdatePropertyDto();
}
