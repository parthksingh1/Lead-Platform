const request = require('supertest');
const { app } = require('./setup');
const { createAdmin, createMember } = require('./helpers');
const Lead = require('../src/models/Lead');

describe('Lead Endpoints', () => {
  let admin, member, adminToken, memberToken;

  beforeEach(async () => {
    const a = await createAdmin({ email: 'admin@test.com' });
    const m = await createMember({ email: 'member@test.com' });
    admin = a.user;
    member = m.user;
    adminToken = a.accessToken;
    memberToken = m.accessToken;
  });

  // ── Public Lead Capture ──────────────────────────────────
  describe('POST /api/leads (public capture)', () => {
    it('should create a lead without authentication', async () => {
      const res = await request(app)
        .post('/api/leads')
        .send({
          name: 'Public Lead',
          email: 'public@example.com',
          company: 'TestCo',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.lead.name).toBe('Public Lead');
      expect(res.body.data.lead.status).toBe('new');
    });

    it('should reject lead without required fields', async () => {
      const res = await request(app)
        .post('/api/leads')
        .send({ name: 'No Email' });

      expect(res.status).toBe(400);
    });
  });

  // ── List Leads with Pagination ───────────────────────────
  describe('GET /api/leads', () => {
    beforeEach(async () => {
      // Create 3 leads, 2 assigned to member, 1 unassigned
      await Lead.create([
        { name: 'Lead 1', email: 'l1@t.com', status: 'new', assignedTo: member._id,
          activity: [{ action: 'lead_created', details: {} }] },
        { name: 'Lead 2', email: 'l2@t.com', status: 'contacted', assignedTo: member._id,
          activity: [{ action: 'lead_created', details: {} }] },
        { name: 'Lead 3', email: 'l3@t.com', status: 'new', assignedTo: null,
          activity: [{ action: 'lead_created', details: {} }] },
      ]);
    });

    it('admin should see all leads', async () => {
      const res = await request(app)
        .get('/api/leads')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.leads.length).toBe(3);
      expect(res.body.data.pagination).toBeDefined();
      expect(res.body.data.pagination.total).toBe(3);
    });

    it('member should see only their assigned leads', async () => {
      const res = await request(app)
        .get('/api/leads')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.leads.length).toBe(2);
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/api/leads?status=new')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.leads.every((l) => l.status === 'new')).toBe(true);
    });

    it('should paginate correctly', async () => {
      const res = await request(app)
        .get('/api/leads?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.leads.length).toBe(2);
      expect(res.body.data.pagination.pages).toBe(2);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/leads');
      expect(res.status).toBe(401);
    });
  });

  // ── Status Pipeline ──────────────────────────────────────
  describe('PATCH /api/leads/:id/status', () => {
    it('should update lead status and log activity', async () => {
      const lead = await Lead.create({
        name: 'Pipeline Lead',
        email: 'pipe@t.com',
        status: 'new',
        assignedTo: member._id,
        activity: [{ action: 'lead_created', details: {} }],
      });

      const res = await request(app)
        .patch(`/api/leads/${lead._id}/status`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ status: 'contacted' });

      expect(res.status).toBe(200);
      expect(res.body.data.lead.status).toBe('contacted');

      // Verify activity trail recorded the change
      const updated = await Lead.findById(lead._id);
      const statusChange = updated.activity.find(
        (a) => a.action === 'status_changed'
      );
      expect(statusChange).toBeDefined();
      expect(statusChange.details.from).toBe('new');
      expect(statusChange.details.to).toBe('contacted');
    });

    it('should reject invalid status', async () => {
      const lead = await Lead.create({
        name: 'Bad Status',
        email: 'bad@t.com',
        assignedTo: member._id,
        activity: [{ action: 'lead_created', details: {} }],
      });

      const res = await request(app)
        .patch(`/api/leads/${lead._id}/status`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ status: 'invalid_status' });

      expect(res.status).toBe(400);
    });
  });

  // ── Assignment (Admin Only) ──────────────────────────────
  describe('PATCH /api/leads/:id/assign', () => {
    it('admin should assign a lead to a member', async () => {
      const lead = await Lead.create({
        name: 'Assign Me',
        email: 'assign@t.com',
        activity: [{ action: 'lead_created', details: {} }],
      });

      const res = await request(app)
        .patch(`/api/leads/${lead._id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ assignedTo: member._id });

      expect(res.status).toBe(200);
      expect(res.body.data.lead.assignedTo.id).toBe(member._id.toString());
    });

    it('member should NOT be able to assign leads', async () => {
      const lead = await Lead.create({
        name: 'No Assign',
        email: 'noassign@t.com',
        assignedTo: member._id,
        activity: [{ action: 'lead_created', details: {} }],
      });

      const res = await request(app)
        .patch(`/api/leads/${lead._id}/assign`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ assignedTo: admin._id });

      expect(res.status).toBe(403);
    });
  });

  // ── Notes ────────────────────────────────────────────────
  describe('POST /api/leads/:id/notes', () => {
    it('should add a note with timestamp and activity log', async () => {
      const lead = await Lead.create({
        name: 'Note Lead',
        email: 'note@t.com',
        assignedTo: member._id,
        activity: [{ action: 'lead_created', details: {} }],
      });

      const res = await request(app)
        .post(`/api/leads/${lead._id}/notes`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ text: 'Had a great call. Moving forward.' });

      expect(res.status).toBe(200);
      expect(res.body.data.lead.notes.length).toBe(1);
      expect(res.body.data.lead.notes[0].text).toBe(
        'Had a great call. Moving forward.'
      );
      expect(res.body.data.lead.notes[0].createdAt).toBeDefined();
    });
  });

  // ── Delete (Admin Only) ──────────────────────────────────
  describe('DELETE /api/leads/:id', () => {
    it('admin should delete a lead', async () => {
      const lead = await Lead.create({
        name: 'Delete Me',
        email: 'del@t.com',
        activity: [{ action: 'lead_created', details: {} }],
      });

      const res = await request(app)
        .delete(`/api/leads/${lead._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      const found = await Lead.findById(lead._id);
      expect(found).toBeNull();
    });

    it('member should NOT delete leads', async () => {
      const lead = await Lead.create({
        name: 'No Delete',
        email: 'nodel@t.com',
        assignedTo: member._id,
        activity: [{ action: 'lead_created', details: {} }],
      });

      const res = await request(app)
        .delete(`/api/leads/${lead._id}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
    });
  });

  // ── Stats (Admin Only) ───────────────────────────────────
  describe('GET /api/leads/stats', () => {
    it('admin should get pipeline stats', async () => {
      await Lead.create([
        { name: 'S1', email: 's1@t.com', status: 'new', activity: [] },
        { name: 'S2', email: 's2@t.com', status: 'new', activity: [] },
        { name: 'S3', email: 's3@t.com', status: 'won', activity: [] },
      ]);

      const res = await request(app)
        .get('/api/leads/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(3);
      expect(res.body.data.byStatus.new).toBe(2);
      expect(res.body.data.byStatus.won).toBe(1);
    });

    it('member should NOT access stats', async () => {
      const res = await request(app)
        .get('/api/leads/stats')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
    });
  });
});
