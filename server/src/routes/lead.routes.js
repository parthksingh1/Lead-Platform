const express = require('express');
const router = express.Router();
const {
  createLead,
  getLeads,
  getLead,
  updateLead,
  updateStatus,
  assignLead,
  addNote,
  deleteLead,
  getStats,
} = require('../controllers/lead.controller');
const {
  createLeadRules,
  updateLeadRules,
  updateStatusRules,
  assignLeadRules,
  addNoteRules,
  listLeadsRules,
} = require('../validators/lead.validators');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');

// Public route — lead capture form submits here
router.post('/', createLeadRules, validate, createLead);

// All routes below require authentication
router.use(authenticate);

// Pipeline stats — admin only
router.get('/stats', authorize('admin'), getStats);

// List & detail
router.get('/', listLeadsRules, validate, getLeads);
router.get('/:id', getLead);

// Mutations
router.put('/:id', updateLeadRules, validate, updateLead);
router.patch('/:id/status', updateStatusRules, validate, updateStatus);
router.patch('/:id/assign', authorize('admin'), assignLeadRules, validate, assignLead);
router.post('/:id/notes', addNoteRules, validate, addNote);
router.delete('/:id', authorize('admin'), deleteLead);

module.exports = router;
