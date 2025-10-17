import { BaseModel } from '@libraries/baseModel.entity';
import { User } from '@modules/user/entities/user.entity';
import { ApiHideProperty } from '@nestjs/swagger';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';

export enum PropertyType {
  Office = 'office',
  Medical = 'medical',
  Industrial = 'industrial',
  Other = 'other',
}

@Table({
  tableName: 'property',
})
export class Property extends BaseModel<Property> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.ENUM(...Object.values(PropertyType)),
    allowNull: false,
    defaultValue: PropertyType.Office,
  })
  type: PropertyType;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  address: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  city: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  state: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  zipCode: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  country: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  squareFeet: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  alarmCode: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  accessInstructions: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  contactName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  contactPhone: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  isActive: boolean;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;

  @ApiHideProperty()
  @BelongsTo(() => User)
  user: User;
}
