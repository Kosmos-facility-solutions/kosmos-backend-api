import Sequelize from 'sequelize';

const info = {
  revision: '20251124195000',
  name: 'service-visit',
  created: '2025-11-24T19:50:00.000Z',
  comment: '',
};

const migrationCommands = [
  {
    fn: 'createTable',
    params: [
      'service_visit',
      {
        id: {
          type: Sequelize.INTEGER,
          field: 'id',
          primaryKey: true,
          allowNull: true,
          autoIncrement: true,
        },
        contractId: {
          type: Sequelize.INTEGER,
          field: 'contractId',
          allowNull: false,
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          references: { model: 'contract', key: 'id' },
        },
        serviceRequestId: {
          type: Sequelize.INTEGER,
          field: 'serviceRequestId',
          allowNull: true,
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          references: { model: 'service_request', key: 'id' },
        },
        scheduledDate: {
          type: Sequelize.DATEONLY,
          field: 'scheduledDate',
          allowNull: false,
        },
        scheduledTime: {
          type: Sequelize.TIME,
          field: 'scheduledTime',
          allowNull: true,
        },
        status: {
          type: Sequelize.ENUM('pending', 'completed', 'skipped', 'cancelled'),
          field: 'status',
          allowNull: false,
          defaultValue: 'pending',
        },
        notes: {
          type: Sequelize.TEXT,
          field: 'notes',
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
