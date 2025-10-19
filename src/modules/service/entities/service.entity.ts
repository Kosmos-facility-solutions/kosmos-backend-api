import { BaseModel } from '@libraries/baseModel.entity';
import { Column, DataType, Table } from 'sequelize-typescript';

export enum ServiceCategory {
  OfficeCleaning = 'office_cleaning',
  DeepCleaning = 'deep_cleaning',
  FloorCare = 'floor_care',
  WindowCleaning = 'window_cleaning',
  CarpetCare = 'carpet_care',
  Sanitization = 'sanitization',
  PowerWashing = 'power_washing',
  SpecialEventPrep = 'special_event_prep',
}

@Table({
  tableName: 'service',
})
export class Service extends BaseModel<Service> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.ENUM(...Object.values(ServiceCategory)),
    allowNull: false,
  })
  category: ServiceCategory;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  basePrice: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  priceUnit: string; // e.g., "per hour", "per sq ft", "flat rate"

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  estimatedDurationMinutes: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  icon: string; // URL or icon name

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  isActive: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  displayOrder: number;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  features: string[]; // e.g., ["Eco-friendly products", "Licensed professionals"]

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  requirements: string[]; // e.g., ["Water access required", "Minimum 2 hour booking"]
}
