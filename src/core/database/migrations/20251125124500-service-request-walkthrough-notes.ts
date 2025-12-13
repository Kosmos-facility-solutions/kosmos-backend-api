import Sequelize from 'sequelize';

const info = {
  revision: '20251125124500',
  name: 'service-request-walkthrough-notes',
  created: '2025-11-25T12:45:00.000Z',
  comment: 'Add walkthrough notes column to service_request',
};

const migrationCommands = [
  {
    fn: 'addColumn',
    params: [
      'service_request',
      'walkthroughNotes',
      {
        type: Sequelize.TEXT,
        field: 'walkthroughNotes',
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
