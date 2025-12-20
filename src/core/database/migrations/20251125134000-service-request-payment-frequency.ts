import Sequelize from 'sequelize';

const info = {
  revision: '20251125134000',
  name: 'service-request-payment-frequency',
  created: '2025-11-25T13:40:00.000Z',
  comment: 'Add paymentFrequency to service_request (weekly, bi_weekly, monthly)',
};

const migrationCommands = [
  {
    fn: 'addColumn',
    params: [
      'service_request',
      'paymentFrequency',
      {
        type: Sequelize.ENUM('weekly', 'bi_weekly', 'monthly'),
        field: 'paymentFrequency',
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
