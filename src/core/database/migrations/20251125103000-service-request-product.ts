import Sequelize from 'sequelize';

const info = {
  revision: '20251125103000',
  name: 'service-request-product',
  created: '2025-11-25T10:30:00.000Z',
  comment: '',
};

const migrationCommands = [
  {
    fn: 'createTable',
    params: [
      'service_request_product',
      {
        id: {
          type: Sequelize.INTEGER,
          field: 'id',
          primaryKey: true,
          allowNull: true,
          autoIncrement: true,
        },
        serviceRequestId: {
          type: Sequelize.INTEGER,
          field: 'serviceRequestId',
          allowNull: false,
          unique: 'service_request_product_unique',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          references: { model: 'service_request', key: 'id' },
        },
        productId: {
          type: Sequelize.INTEGER,
          field: 'productId',
          allowNull: false,
          unique: 'service_request_product_unique',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          references: { model: 'product', key: 'id' },
        },
        quantity: {
          type: Sequelize.INTEGER,
          field: 'quantity',
          allowNull: false,
          defaultValue: 1,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: 'createdAt',
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: 'updatedAt',
          allowNull: false,
        },
      },
      {},
    ],
  },
];

async function up({ context: queryInterface }) {
  for (const command of migrationCommands) {
    await queryInterface[command.fn](...command.params);
  }
}

module.exports = {
  up,
  info,
};
