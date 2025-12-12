import Sequelize from 'sequelize';

const info = {
  revision: '20251125123000',
  name: 'service-request-preferred-call',
  created: '2025-11-25T12:30:00.000Z',
  comment: 'Add preferred walkthrough contact time to service_request',
};

const migrationCommands = [
  {
    fn: 'addColumn',
    params: [
      'service_request',
      'preferredWalkthroughContactTime',
      {
        type: Sequelize.STRING,
        field: 'preferredWalkthroughContactTime',
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
