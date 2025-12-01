import Sequelize from 'sequelize';

/**
 * Actions summary:
 *
 * createTable "service_request_staff", deps: [service_request, user]
 *
 **/

const info = {
  revision: '20251125110000',
  name: 'service-request-staff',
  created: '2025-11-25T11:00:00.000Z',
  comment: '',
};

const migrationCommands = [
  {
    fn: 'createTable',
    params: [
      'service_request_staff',
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
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          references: { model: 'service_request', key: 'id' },
        },
        staffId: {
          type: Sequelize.INTEGER,
          field: 'staffId',
          allowNull: false,
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          references: { model: 'user', key: 'id' },
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
