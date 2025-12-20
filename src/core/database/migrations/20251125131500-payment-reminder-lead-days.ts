import Sequelize from 'sequelize';

const info = {
  revision: '20251125131500',
  name: 'payment-reminder-lead-days',
  created: '2025-11-25T13:15:00.000Z',
  comment: 'Add per-contract/service-request payment reminder lead days',
};

const migrationCommands = [
  {
    fn: 'addColumn',
    params: [
      'contract',
      'paymentReminderLeadDays',
      {
        type: Sequelize.INTEGER,
        field: 'paymentReminderLeadDays',
        allowNull: true,
      },
    ],
  },
  {
    fn: 'addColumn',
    params: [
      'service_request',
      'paymentReminderLeadDays',
      {
        type: Sequelize.INTEGER,
        field: 'paymentReminderLeadDays',
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
