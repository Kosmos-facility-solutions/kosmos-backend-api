import Sequelize from 'sequelize';

const info = {
  revision: '20251124211000',
  name: 'product',
  created: '2025-11-24T21:10:00.000Z',
  comment: '',
};

const migrationCommands = [
  {
    fn: 'createTable',
    params: [
      'product',
      {
        id: {
          type: Sequelize.INTEGER,
          field: 'id',
          autoIncrement: true,
          allowNull: true,
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING,
          field: 'name',
          allowNull: false,
        },
        price: {
          type: Sequelize.DECIMAL(10, 2),
          field: 'price',
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          field: 'description',
          allowNull: true,
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
