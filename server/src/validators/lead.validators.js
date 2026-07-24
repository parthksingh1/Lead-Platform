const { body, query } = require('express-validator');
const Lead = require('../models/Lead');

const createLeadRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone cannot exceed 20 characters'),

  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),

  body('source')
    .optional()
    .isIn(Lead.SOURCES)
    .withMessage(`Source must be one of: ${Lead.SOURCES.join(', ')}`),
];

const updateLeadRules = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone cannot exceed 20 characters'),

  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),

  body('source')
    .optional()
    .isIn(Lead.SOURCES)
    .withMessage(`Source must be one of: ${Lead.SOURCES.join(', ')}`),
];

const updateStatusRules = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(Lead.STATUSES))
    .withMessage(
      `Status must be one of: ${Object.values(Lead.STATUSES).join(', ')}`
    ),
];

const assignLeadRules = [
  body('assignedTo')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID format'),
];

const addNoteRules = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Note text is required')
    .isLength({ max: 2000 })
    .withMessage('Note cannot exceed 2000 characters'),
];

const listLeadsRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('status')
    .optional()
    .isIn(Object.values(Lead.STATUSES))
    .withMessage(
      `Status must be one of: ${Object.values(Lead.STATUSES).join(', ')}`
    ),

  query('assignedTo').optional().isMongoId().withMessage('Invalid user ID'),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'name', 'status'])
    .withMessage('Invalid sort field'),

  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
];

module.exports = {
  createLeadRules,
  updateLeadRules,
  updateStatusRules,
  assignLeadRules,
  addNoteRules,
  listLeadsRules,
};
