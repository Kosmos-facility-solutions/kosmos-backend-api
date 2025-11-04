import Sequelize from 'sequelize';

/**
 * Actions summary:
 *
 * addColumn "isFirstLogin" to table "user"
 *
 **/

const info = {
  revision: '20251104172401',
  name: 'migration',
  created: '2025-11-04T21:24:01.276Z',
  comment: '',
};

const migrationCommands = [
  {
    fn: 'addColumn',
    params: [
      'user',
      'isFirstLogin',
      {
        type: Sequelize.BOOLEAN,
        field: 'isFirstLogin',
        defaultValue: true,
        allowNull: false,
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
  info: info,
};
