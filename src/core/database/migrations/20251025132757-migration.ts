import Sequelize from 'sequelize';

/**
 * Actions summary:
 *
 * addColumn "additionalPhone" to table "user"
 * addColumn "phone" to table "user"
 *
 **/

const info = {
  revision: '20251025132757',
  name: 'migration',
  created: '2025-10-25T17:27:57.485Z',
  comment: '',
};

const migrationCommands = [
  {
    fn: 'addColumn',
    params: [
      'user',
      'additionalPhone',
      { type: Sequelize.STRING, field: 'additionalPhone', allowNull: true },
    ],
  },
  {
    fn: 'addColumn',
    params: [
      'user',
      'phone',
      { type: Sequelize.STRING, field: 'phone', allowNull: true },
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
