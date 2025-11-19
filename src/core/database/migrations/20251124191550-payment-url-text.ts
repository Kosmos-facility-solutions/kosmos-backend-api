import Sequelize from 'sequelize';

/**
 * Adjust payment URL columns to TEXT to avoid length issues.
 */

const info = {
  revision: '20251124191550',
  name: 'payment-url-text',
  created: '2025-11-24T19:15:50.000Z',
  comment: '',
};

const migrationCommands = [
  {
    fn: 'changeColumn',
    params: [
      'payment',
      'paymentUrl',
      {
        type: Sequelize.TEXT,
        field: 'paymentUrl',
        allowNull: true,
      },
    ],
  },
  {
    fn: 'changeColumn',
    params: [
      'payment',
      'receiptUrl',
      {
        type: Sequelize.TEXT,
        field: 'receiptUrl',
        allowNull: true,
      },
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
