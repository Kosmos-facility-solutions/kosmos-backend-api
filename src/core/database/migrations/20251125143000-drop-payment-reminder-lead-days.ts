import Sequelize from 'sequelize';

const info = {
  revision: '20251125143000',
  name: 'drop-payment-reminder-lead-days',
  created: '2025-11-25T14:30:00.000Z',
  comment: 'Remove paymentReminderLeadDays from contract and service_request',
};

const migrationCommands = [
  {
    fn: 'removeColumn',
    params: ['contract', 'paymentReminderLeadDays'],
  },
  {
    fn: 'removeColumn',
    params: ['service_request', 'paymentReminderLeadDays'],
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
