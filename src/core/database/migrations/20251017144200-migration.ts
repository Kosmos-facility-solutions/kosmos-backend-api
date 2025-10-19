import Sequelize from 'sequelize';

/**
 * Actions summary:
 *
 * createTable "service", deps: []
 *
 **/

const info = {
  revision: '20251017144200',
  name: 'migration',
  created: '2025-10-17T18:42:00.671Z',
  comment: '',
};

const migrationCommands = [
  {
    fn: 'createTable',
    params: [
      'service',
      {
        id: {
          type: Sequelize.INTEGER,
          field: 'id',
          primaryKey: true,
          allowNull: true,
          autoIncrement: true,
        },
        name: { type: Sequelize.STRING, field: 'name', allowNull: false },
        description: {
          type: Sequelize.TEXT,
          field: 'description',
          allowNull: true,
        },
        category: {
          type: Sequelize.ENUM(
            'office_cleaning',
            'deep_cleaning',
            'floor_care',
            'window_cleaning',
            'carpet_care',
            'sanitization',
            'power_washing',
            'special_event_prep',
          ),
          field: 'category',
          allowNull: false,
        },
        basePrice: {
          type: Sequelize.DECIMAL(10, 2),
          field: 'basePrice',
          allowNull: false,
        },
        priceUnit: {
          type: Sequelize.STRING,
          field: 'priceUnit',
          allowNull: true,
        },
        estimatedDurationMinutes: {
          type: Sequelize.INTEGER,
          field: 'estimatedDurationMinutes',
          allowNull: true,
        },
        icon: { type: Sequelize.STRING, field: 'icon', allowNull: true },
        isActive: {
          type: Sequelize.BOOLEAN,
          field: 'isActive',
          defaultValue: true,
          allowNull: false,
        },
        displayOrder: {
          type: Sequelize.INTEGER,
          field: 'displayOrder',
          defaultValue: 0,
          allowNull: false,
        },
        features: { type: Sequelize.JSON, field: 'features', allowNull: true },
        requirements: {
          type: Sequelize.JSON,
          field: 'requirements',
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
