import Sequelize from 'sequelize';

/**
 * Actions summary:
 *
 * createTable "contract", deps: [user, service_request, property]
 *
 **/

const info = {
  revision: '20251101134917',
  name: 'migration',
  created: '2025-11-01T17:49:17.405Z',
  comment: '',
};

const migrationCommands = [
  {
    fn: 'createTable',
    params: [
      'contract',
      {
        id: {
          type: Sequelize.INTEGER,
          field: 'id',
          primaryKey: true,
          allowNull: true,
          autoIncrement: true,
        },
        clientId: {
          type: Sequelize.INTEGER,
          onUpdate: 'CASCADE',
          onDelete: 'NO ACTION',
          references: { model: 'user', key: 'id' },
          name: 'clientId',
          field: 'clientId',
          allowNull: false,
        },
        serviceRequestId: {
          type: Sequelize.INTEGER,
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          references: { model: 'service_request', key: 'id' },
          name: 'serviceRequestId',
          field: 'serviceRequestId',
          allowNull: true,
        },
        propertyId: {
          type: Sequelize.INTEGER,
          onUpdate: 'CASCADE',
          onDelete: 'NO ACTION',
          references: { model: 'property', key: 'id' },
          name: 'propertyId',
          field: 'propertyId',
          allowNull: false,
        },
        contractNumber: {
          type: Sequelize.STRING,
          field: 'contractNumber',
          unique: true,
          allowNull: false,
        },
        status: {
          type: Sequelize.ENUM(
            'draft',
            'active',
            'paused',
            'completed',
            'cancelled',
          ),
          field: 'status',
          defaultValue: 'draft',
          allowNull: false,
        },
        startDate: {
          type: Sequelize.DATEONLY,
          field: 'startDate',
          allowNull: false,
        },
        endDate: {
          type: Sequelize.DATEONLY,
          field: 'endDate',
          allowNull: true,
        },
        paymentAmount: {
          type: Sequelize.DECIMAL(10, 2),
          field: 'paymentAmount',
          allowNull: false,
        },
        paymentFrequency: {
          type: Sequelize.ENUM(
            'weekly',
            'bi_weekly',
            'monthly',
            'quarterly',
            'one_time',
          ),
          field: 'paymentFrequency',
          allowNull: false,
        },
        nextPaymentDue: {
          type: Sequelize.DATEONLY,
          field: 'nextPaymentDue',
          allowNull: true,
        },
        lastPaymentDate: {
          type: Sequelize.DATEONLY,
          field: 'lastPaymentDate',
          allowNull: true,
        },
        paymentMethod: {
          type: Sequelize.STRING,
          field: 'paymentMethod',
          allowNull: true,
        },
        workDays: { type: Sequelize.JSON, field: 'workDays', allowNull: true },
        workStartTime: {
          type: Sequelize.TIME,
          field: 'workStartTime',
          allowNull: true,
        },
        workEndTime: {
          type: Sequelize.TIME,
          field: 'workEndTime',
          allowNull: true,
        },
        serviceFrequency: {
          type: Sequelize.ENUM(
            'one_time',
            'daily',
            'weekly',
            'bi_weekly',
            'monthly',
            'quarterly',
          ),
          field: 'serviceFrequency',
          defaultValue: 'weekly',
          allowNull: false,
        },
        terms: { type: Sequelize.TEXT, field: 'terms', allowNull: true },
        notes: { type: Sequelize.TEXT, field: 'notes', allowNull: true },
        scope: { type: Sequelize.TEXT, field: 'scope', allowNull: true },
        isActive: {
          type: Sequelize.BOOLEAN,
          field: 'isActive',
          defaultValue: true,
          allowNull: false,
        },
        totalContractValue: {
          type: Sequelize.DECIMAL(10, 2),
          field: 'totalContractValue',
          allowNull: true,
        },
        estimatedDurationMinutes: {
          type: Sequelize.INTEGER,
          field: 'estimatedDurationMinutes',
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
  info: info,
};
