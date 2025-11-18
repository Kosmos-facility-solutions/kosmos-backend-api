import Sequelize from 'sequelize';

/**
 * Actions summary:
 *
 * createTable "payment", deps: [user, service_request, contract]
 *
 **/

const info = {
  revision: '20251124183000',
  name: 'payments-module',
  created: '2025-11-24T18:30:00.000Z',
  comment: '',
};

const migrationCommands = [
  {
    fn: 'createTable',
    params: [
      'payment',
      {
        id: {
          type: Sequelize.INTEGER,
          field: 'id',
          primaryKey: true,
          allowNull: true,
          autoIncrement: true,
        },
        userId: {
          type: Sequelize.INTEGER,
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          references: { model: 'user', key: 'id' },
          name: 'userId',
          field: 'userId',
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
        contractId: {
          type: Sequelize.INTEGER,
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          references: { model: 'contract', key: 'id' },
          name: 'contractId',
          field: 'contractId',
          allowNull: true,
        },
        amount: {
          type: Sequelize.DECIMAL(10, 2),
          field: 'amount',
          allowNull: false,
        },
        currency: {
          type: Sequelize.STRING,
          field: 'currency',
          allowNull: false,
          defaultValue: 'USD',
        },
        status: {
          type: Sequelize.ENUM(
            'pending',
            'requires_action',
            'processing',
            'succeeded',
            'failed',
            'canceled',
            'refunded',
          ),
          field: 'status',
          allowNull: false,
          defaultValue: 'pending',
        },
        provider: {
          type: Sequelize.STRING,
          field: 'provider',
          allowNull: false,
        },
        channel: {
          type: Sequelize.STRING,
          field: 'channel',
          allowNull: true,
        },
        providerPaymentId: {
          type: Sequelize.STRING,
          field: 'providerPaymentId',
          unique: true,
          allowNull: true,
        },
        providerCustomerId: {
          type: Sequelize.STRING,
          field: 'providerCustomerId',
          allowNull: true,
        },
        description: {
          type: Sequelize.TEXT,
          field: 'description',
          allowNull: true,
        },
        reference: {
          type: Sequelize.STRING,
          field: 'reference',
          allowNull: false,
          unique: true,
        },
        metadata: {
          type: Sequelize.JSON,
          field: 'metadata',
          allowNull: true,
        },
        paymentUrl: {
          type: Sequelize.STRING,
          field: 'paymentUrl',
          allowNull: true,
        },
        receiptUrl: {
          type: Sequelize.STRING,
          field: 'receiptUrl',
          allowNull: true,
        },
        paidAt: {
          type: Sequelize.DATE,
          field: 'paidAt',
          allowNull: true,
        },
        expiresAt: {
          type: Sequelize.DATE,
          field: 'expiresAt',
          allowNull: true,
        },
        failureReason: {
          type: Sequelize.TEXT,
          field: 'failureReason',
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
