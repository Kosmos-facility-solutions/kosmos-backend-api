import { SequelizeCrudRepository } from '@libraries/SequelizeCrudRepository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductRepository extends SequelizeCrudRepository<Product> {
  constructor(
    @InjectModel(Product)
    protected model: typeof Product,
    protected sequelize?: Sequelize,
  ) {
    super(sequelize);
  }
}
