import Sequelize from 'sequelize';

/**
 * Actions summary:
 *
 * addColumn "walkthroughTime" to table "service_request"
 * addColumn "walkthroughDate" to table "service_request"
 *
 **/

const info = {
  revision: '20251103153557',
  name: 'migration',
  created: '2025-11-03T19:35:57.209Z',
  comment: '',
};

const migrationCommands = [
  {
    fn: 'addColumn',
    params: [
      'service_request',
      'walkthroughTime',
      { type: Sequelize.TIME, field: 'walkthroughTime', allowNull: true },
    ],
  },
  {
    fn: 'addColumn',
    params: [
      'service_request',
      'walkthroughDate',
      { type: Sequelize.DATEONLY, field: 'walkthroughDate', allowNull: true },
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
