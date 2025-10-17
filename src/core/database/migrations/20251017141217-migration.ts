import Sequelize from 'sequelize';

/**
 * Actions summary:
 *
 * createTable "role", deps: []
 * createTable "user", deps: []
 * createTable "federatedcredential", deps: [user]
 * createTable "property", deps: [user]
 * createTable "userrole", deps: [user, role]
 * addIndex "federatedcredential_subject_provider" to table "federatedcredential"
 *
 **/

const info = {
  revision: '20251017141217',
  name: 'migration',
  created: '2025-10-17T18:12:17.268Z',
  comment: '',
};

const migrationCommands = [
  {
    fn: 'createTable',
    params: [
      'role',
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
          type: Sequelize.STRING,
          field: 'description',
          allowNull: false,
        },
        isDefault: {
          type: Sequelize.BOOLEAN,
          field: 'isDefault',
          defaultValue: false,
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
  {
    fn: 'createTable',
    params: [
      'user',
      {
        id: {
          type: Sequelize.INTEGER,
          field: 'id',
          primaryKey: true,
          allowNull: true,
          autoIncrement: true,
        },
        firstName: {
          type: Sequelize.STRING,
          field: 'firstName',
          defaultValue: null,
          allowNull: true,
        },
        lastName: {
          type: Sequelize.STRING,
          field: 'lastName',
          defaultValue: null,
          allowNull: true,
        },
        email: {
          type: Sequelize.STRING,
          field: 'email',
          validate: { isEmail: true },
          unique: true,
          allowNull: false,
        },
        isActive: {
          type: Sequelize.BOOLEAN,
          field: 'isActive',
          defaultValue: false,
          allowNull: false,
        },
        isEmailConfirmed: {
          type: Sequelize.BOOLEAN,
          field: 'isEmailConfirmed',
          defaultValue: false,
          allowNull: false,
        },
        password: {
          type: Sequelize.STRING,
          field: 'password',
          validate: { len: [8, 255] },
          allowNull: false,
        },
        authType: {
          type: Sequelize.ENUM('email'),
          field: 'authType',
          defaultValue: 'email',
          allowNull: false,
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
  {
    fn: 'createTable',
    params: [
      'federatedcredential',
      {
        id: {
          type: Sequelize.INTEGER,
          field: 'id',
          primaryKey: true,
          allowNull: true,
          autoIncrement: true,
        },
        subject: { type: Sequelize.STRING, field: 'subject', allowNull: true },
        provider: {
          type: Sequelize.STRING,
          field: 'provider',
          allowNull: true,
        },
        userId: {
          type: Sequelize.INTEGER,
          onUpdate: 'CASCADE',
          onDelete: 'NO ACTION',
          references: { model: 'user', key: 'id' },
          name: 'userId',
          field: 'userId',
          allowNull: false,
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
  {
    fn: 'createTable',
    params: [
      'property',
      {
        id: {
          type: Sequelize.INTEGER,
          field: 'id',
          primaryKey: true,
          allowNull: true,
          autoIncrement: true,
        },
        name: { type: Sequelize.STRING, field: 'name', allowNull: false },
        type: {
          type: Sequelize.ENUM('office', 'medical', 'industrial', 'other'),
          field: 'type',
          defaultValue: 'office',
          allowNull: false,
        },
        address: { type: Sequelize.STRING, field: 'address', allowNull: false },
        city: { type: Sequelize.STRING, field: 'city', allowNull: true },
        state: { type: Sequelize.STRING, field: 'state', allowNull: true },
        zipCode: { type: Sequelize.STRING, field: 'zipCode', allowNull: true },
        country: { type: Sequelize.STRING, field: 'country', allowNull: true },
        squareFeet: {
          type: Sequelize.INTEGER,
          field: 'squareFeet',
          allowNull: true,
        },
        alarmCode: {
          type: Sequelize.STRING,
          field: 'alarmCode',
          allowNull: true,
        },
        accessInstructions: {
          type: Sequelize.TEXT,
          field: 'accessInstructions',
          allowNull: true,
        },
        contactName: {
          type: Sequelize.STRING,
          field: 'contactName',
          allowNull: true,
        },
        contactPhone: {
          type: Sequelize.STRING,
          field: 'contactPhone',
          allowNull: true,
        },
        isActive: {
          type: Sequelize.BOOLEAN,
          field: 'isActive',
          defaultValue: true,
          allowNull: false,
        },
        userId: {
          type: Sequelize.INTEGER,
          onUpdate: 'CASCADE',
          onDelete: 'NO ACTION',
          references: { model: 'user', key: 'id' },
          name: 'userId',
          field: 'userId',
          allowNull: false,
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
  {
    fn: 'createTable',
    params: [
      'userrole',
      {
        id: {
          type: Sequelize.INTEGER,
          field: 'id',
          primaryKey: true,
          allowNull: true,
          autoIncrement: true,
        },
        userId: {
          type: Sequelize.INTEGER,
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          references: { model: 'user', key: 'id' },
          name: 'userId',
          field: 'userId',
          allowNull: false,
        },
        roleId: {
          type: Sequelize.INTEGER,
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          references: { model: 'role', key: 'id' },
          name: 'roleId',
          field: 'roleId',
          allowNull: false,
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
  {
    fn: 'addIndex',
    params: [
      'federatedcredential',
      ['subject', 'provider'],
      {
        indexName: 'federatedcredential_subject_provider',
        name: 'federatedcredential_subject_provider',
        indicesType: 'UNIQUE',
        type: 'UNIQUE',
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
