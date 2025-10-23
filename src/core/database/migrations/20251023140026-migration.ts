import Sequelize from 'sequelize';

/**
 * Actions summary:
 *
 * createTable "service_request", deps: [user, property, service]
 * createTable "service_report", deps: [service_request, user, user]
 *
 **/

const info = {
  revision: '20251023140026',
  name: 'migration',
  created: '2025-10-23T18:00:26.183Z',
  comment: '',
};

const migrationCommands = [
  {
    fn: 'createTable',
    params: [
      'service_request',
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
          onDelete: 'NO ACTION',
          references: { model: 'user', key: 'id' },
          name: 'userId',
          field: 'userId',
          allowNull: false,
        },
        propertyId: {
          type: Sequelize.INTEGER,
          onUpdate: 'CASCADE',
          onDelete: 'NO ACTION',
          references: { model: 'property', key: 'id' },
          name: 'propertyId',
          field: 'propertyId',
          allowNull: false,
        },
        serviceId: {
          type: Sequelize.INTEGER,
          onUpdate: 'CASCADE',
          onDelete: 'NO ACTION',
          references: { model: 'service', key: 'id' },
          name: 'serviceId',
          field: 'serviceId',
          allowNull: false,
        },
        status: {
          type: Sequelize.ENUM(
            'pending',
            'scheduled',
            'in_progress',
            'completed',
            'cancelled',
          ),
          field: 'status',
          defaultValue: 'pending',
          allowNull: false,
        },
        priority: {
          type: Sequelize.ENUM('low', 'normal', 'high', 'urgent'),
          field: 'priority',
          defaultValue: 'normal',
          allowNull: false,
        },
        scheduledDate: {
          type: Sequelize.DATEONLY,
          field: 'scheduledDate',
          allowNull: false,
        },
        scheduledTime: {
          type: Sequelize.TIME,
          field: 'scheduledTime',
          allowNull: false,
        },
        completedDate: {
          type: Sequelize.DATEONLY,
          field: 'completedDate',
          allowNull: true,
        },
        estimatedPrice: {
          type: Sequelize.DECIMAL(10, 2),
          field: 'estimatedPrice',
          allowNull: false,
        },
        actualPrice: {
          type: Sequelize.DECIMAL(10, 2),
          field: 'actualPrice',
          allowNull: true,
        },
        notes: { type: Sequelize.TEXT, field: 'notes', allowNull: true },
        specialInstructions: {
          type: Sequelize.TEXT,
          field: 'specialInstructions',
          allowNull: true,
        },
        cancellationReason: {
          type: Sequelize.TEXT,
          field: 'cancellationReason',
          allowNull: true,
        },
        recurrenceFrequency: {
          type: Sequelize.ENUM(
            'one_time',
            'daily',
            'weekly',
            'bi_weekly',
            'monthly',
            'quarterly',
          ),
          field: 'recurrenceFrequency',
          defaultValue: 'one_time',
          allowNull: false,
        },
        isRecurring: {
          type: Sequelize.BOOLEAN,
          field: 'isRecurring',
          defaultValue: false,
          allowNull: false,
        },
        recurrenceEndDate: {
          type: Sequelize.DATEONLY,
          field: 'recurrenceEndDate',
          allowNull: true,
        },
        estimatedDurationMinutes: {
          type: Sequelize.INTEGER,
          field: 'estimatedDurationMinutes',
          allowNull: true,
        },
        actualDurationMinutes: {
          type: Sequelize.INTEGER,
          field: 'actualDurationMinutes',
          allowNull: true,
        },
        additionalServices: {
          type: Sequelize.JSON,
          field: 'additionalServices',
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
      'service_report',
      {
        id: {
          type: Sequelize.INTEGER,
          field: 'id',
          primaryKey: true,
          allowNull: true,
          autoIncrement: true,
        },
        serviceRequestId: {
          type: Sequelize.INTEGER,
          onUpdate: 'CASCADE',
          onDelete: 'NO ACTION',
          references: { model: 'service_request', key: 'id' },
          name: 'serviceRequestId',
          field: 'serviceRequestId',
          unique: true,
          allowNull: false,
        },
        staffId: {
          type: Sequelize.INTEGER,
          onUpdate: 'CASCADE',
          onDelete: 'NO ACTION',
          references: { model: 'user', key: 'id' },
          name: 'staffId',
          field: 'staffId',
          allowNull: false,
        },
        status: {
          type: Sequelize.ENUM('draft', 'submitted', 'reviewed', 'approved'),
          field: 'status',
          defaultValue: 'draft',
          allowNull: false,
        },
        rating: {
          type: Sequelize.INTEGER,
          field: 'rating',
          validate: { min: 1, max: 5 },
          allowNull: true,
        },
        comments: { type: Sequelize.TEXT, field: 'comments', allowNull: true },
        beforePhotos: {
          type: Sequelize.JSON,
          field: 'beforePhotos',
          allowNull: true,
        },
        afterPhotos: {
          type: Sequelize.JSON,
          field: 'afterPhotos',
          allowNull: true,
        },
        additionalPhotos: {
          type: Sequelize.JSON,
          field: 'additionalPhotos',
          allowNull: true,
        },
        completedTasks: {
          type: Sequelize.JSON,
          field: 'completedTasks',
          allowNull: true,
        },
        issuesFound: {
          type: Sequelize.JSON,
          field: 'issuesFound',
          allowNull: true,
        },
        timeSpentMinutes: {
          type: Sequelize.INTEGER,
          field: 'timeSpentMinutes',
          allowNull: true,
        },
        startTime: {
          type: Sequelize.TIME,
          field: 'startTime',
          allowNull: true,
        },
        endTime: { type: Sequelize.TIME, field: 'endTime', allowNull: true },
        productsUsed: {
          type: Sequelize.JSON,
          field: 'productsUsed',
          allowNull: true,
        },
        equipmentUsed: {
          type: Sequelize.JSON,
          field: 'equipmentUsed',
          allowNull: true,
        },
        customerFeedback: {
          type: Sequelize.TEXT,
          field: 'customerFeedback',
          allowNull: true,
        },
        customerRating: {
          type: Sequelize.INTEGER,
          field: 'customerRating',
          validate: { min: 1, max: 5 },
          allowNull: true,
        },
        customerWouldRecommend: {
          type: Sequelize.BOOLEAN,
          field: 'customerWouldRecommend',
          defaultValue: false,
          allowNull: false,
        },
        staffNotes: {
          type: Sequelize.TEXT,
          field: 'staffNotes',
          allowNull: true,
        },
        requiresFollowUp: {
          type: Sequelize.BOOLEAN,
          field: 'requiresFollowUp',
          defaultValue: false,
          allowNull: false,
        },
        followUpReason: {
          type: Sequelize.TEXT,
          field: 'followUpReason',
          allowNull: true,
        },
        submittedAt: {
          type: Sequelize.DATEONLY,
          field: 'submittedAt',
          allowNull: true,
        },
        reviewedAt: {
          type: Sequelize.DATEONLY,
          field: 'reviewedAt',
          allowNull: true,
        },
        reviewedBy: {
          type: Sequelize.INTEGER,
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          references: { model: 'user', key: 'id' },
          name: 'reviewedBy',
          field: 'reviewedBy',
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
