const mongoose = require('mongoose');

const STATUSES = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  PROPOSAL: 'proposal',
  WON: 'won',
  LOST: 'lost',
};

const SOURCES = ['website', 'referral', 'linkedin', 'cold_outreach', 'event', 'other'];

const noteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Note text is required'],
      maxlength: [2000, 'Note cannot exceed 2000 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const activitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'lead_created',
        'status_changed',
        'assigned',
        'unassigned',
        'note_added',
        'lead_updated',
        'lead_deleted',
      ],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone cannot exceed 20 characters'],
      default: '',
    },
    company: {
      type: String,
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: Object.values(STATUSES),
      default: STATUSES.NEW,
    },
    source: {
      type: String,
      enum: SOURCES,
      default: 'website',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: [noteSchema],
    activity: [activitySchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Index for common queries — status filtering and assignment lookups
leadSchema.index({ status: 1, assignedTo: 1 });
leadSchema.index({ email: 1 });
leadSchema.index({ createdAt: -1 });

leadSchema.statics.STATUSES = STATUSES;
leadSchema.statics.SOURCES = SOURCES;

module.exports = mongoose.model('Lead', leadSchema);
