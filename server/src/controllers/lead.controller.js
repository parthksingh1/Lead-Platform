const Lead = require('../models/Lead');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const config = require('../config');

/**
 * POST /api/leads (public — no auth required)
 * Public capture form creates a lead with status 'new'.
 */
const createLead = async (req, res, next) => {
  try {
    const { name, email, phone, company, source } = req.body;

    const lead = await Lead.create({
      name,
      email,
      phone,
      company,
      source: source || 'website',
      activity: [
        {
          action: 'lead_created',
          performedBy: req.user?._id || null,
          details: { source: source || 'website' },
        },
      ],
    });

    res.status(201).json({
      success: true,
      data: { lead },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/leads
 * Authenticated. Paginated, filterable, sortable.
 * Members see only their assigned leads. Admins see all.
 */
const getLeads = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = config.pagination.defaultLimit,
      status,
      assignedTo,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), config.pagination.maxLimit);

    // Build filter
    const filter = {};

    // Role-based scoping: members only see their own leads
    if (req.user.role === User.ROLES.MEMBER) {
      filter.assignedTo = req.user._id;
    } else if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .populate('assignedTo', 'name email')
        .sort({ [sortBy]: sortOrder })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Lead.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        leads,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/leads/:id
 * Authenticated. Members can only access their assigned leads.
 */
const getLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('notes.createdBy', 'name email')
      .populate('activity.performedBy', 'name email');

    if (!lead) {
      throw new AppError('Lead not found.', 404);
    }

    // Members can only view leads assigned to them
    if (
      req.user.role === User.ROLES.MEMBER &&
      lead.assignedTo?._id?.toString() !== req.user._id.toString()
    ) {
      throw new AppError('You do not have access to this lead.', 403);
    }

    res.json({
      success: true,
      data: { lead },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/leads/:id
 * Authenticated. Updates lead fields (not status — use PATCH status).
 */
const updateLead = async (req, res, next) => {
  try {
    const { name, email, phone, company, source } = req.body;

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      throw new AppError('Lead not found.', 404);
    }

    // Members can only update leads assigned to them
    if (
      req.user.role === User.ROLES.MEMBER &&
      lead.assignedTo?.toString() !== req.user._id.toString()
    ) {
      throw new AppError('You do not have access to this lead.', 403);
    }

    // Track what changed for the activity trail
    const changes = {};
    if (name && name !== lead.name) changes.name = { from: lead.name, to: name };
    if (email && email !== lead.email) changes.email = { from: lead.email, to: email };
    if (phone !== undefined && phone !== lead.phone) changes.phone = { from: lead.phone, to: phone };
    if (company !== undefined && company !== lead.company) changes.company = { from: lead.company, to: company };

    // Apply updates
    Object.assign(lead, { name, email, phone, company, source });

    if (Object.keys(changes).length > 0) {
      lead.activity.push({
        action: 'lead_updated',
        performedBy: req.user._id,
        details: changes,
      });
    }

    await lead.save();

    const populated = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email')
      .populate('notes.createdBy', 'name email');

    res.json({
      success: true,
      data: { lead: populated },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/leads/:id/status
 * Authenticated. Transitions lead through the pipeline.
 */
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      throw new AppError('Lead not found.', 404);
    }

    if (
      req.user.role === User.ROLES.MEMBER &&
      lead.assignedTo?.toString() !== req.user._id.toString()
    ) {
      throw new AppError('You do not have access to this lead.', 403);
    }

    const previousStatus = lead.status;
    lead.status = status;

    lead.activity.push({
      action: 'status_changed',
      performedBy: req.user._id,
      details: { from: previousStatus, to: status },
    });

    await lead.save();

    res.json({
      success: true,
      data: { lead },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/leads/:id/assign
 * Admin only. Assigns a lead to a team member.
 */
const assignLead = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      throw new AppError('Lead not found.', 404);
    }

    const targetUser = await User.findById(assignedTo);
    if (!targetUser) {
      throw new AppError('Target user not found.', 404);
    }

    const previousAssignee = lead.assignedTo;
    lead.assignedTo = assignedTo;

    lead.activity.push({
      action: 'assigned',
      performedBy: req.user._id,
      details: {
        from: previousAssignee || null,
        to: assignedTo,
        assigneeName: targetUser.name,
      },
    });

    await lead.save();

    const populated = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email');

    res.json({
      success: true,
      data: { lead: populated },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/leads/:id/notes
 * Authenticated. Adds a timestamped note to the lead.
 */
const addNote = async (req, res, next) => {
  try {
    const { text } = req.body;

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      throw new AppError('Lead not found.', 404);
    }

    if (
      req.user.role === User.ROLES.MEMBER &&
      lead.assignedTo?.toString() !== req.user._id.toString()
    ) {
      throw new AppError('You do not have access to this lead.', 403);
    }

    lead.notes.push({ text, createdBy: req.user._id });

    lead.activity.push({
      action: 'note_added',
      performedBy: req.user._id,
      details: { preview: text.substring(0, 100) },
    });

    await lead.save();

    const populated = await Lead.findById(lead._id)
      .populate('notes.createdBy', 'name email');

    res.json({
      success: true,
      data: { lead: populated },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/leads/:id
 * Admin only.
 */
const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      throw new AppError('Lead not found.', 404);
    }

    await Lead.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      data: null,
      message: 'Lead deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/leads/stats
 * Admin only. Returns pipeline stats.
 */
const getStats = async (req, res, next) => {
  try {
    const stats = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = stats.reduce((sum, s) => sum + s.count, 0);
    const byStatus = {};
    stats.forEach((s) => {
      byStatus[s._id] = s.count;
    });

    res.json({
      success: true,
      data: { total, byStatus },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLead,
  getLeads,
  getLead,
  updateLead,
  updateStatus,
  assignLead,
  addNote,
  deleteLead,
  getStats,
};
