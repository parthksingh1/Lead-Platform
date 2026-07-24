const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');
const Lead = require('./models/Lead');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedData = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost:27017/lead-platform'
    );
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Lead.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@leadplatform.com',
      password: 'admin12345',
      role: 'admin',
    });

    const member = await User.create({
      name: 'Sales Rep',
      email: 'member@leadplatform.com',
      password: 'member12345',
      role: 'member',
    });

    console.log('Users created:');
    console.log(`  Admin  → admin@leadplatform.com / admin12345`);
    console.log(`  Member → member@leadplatform.com / member12345`);

    // Create sample leads across pipeline stages
    const leads = await Lead.insertMany([
      {
        name: 'Sarah Chen',
        email: 'sarah@techcorp.com',
        phone: '+1-555-0101',
        company: 'TechCorp',
        status: 'new',
        source: 'website',
        assignedTo: null,
        activity: [{ action: 'lead_created', details: { source: 'website' } }],
      },
      {
        name: 'James Wilson',
        email: 'james@retailbrand.com',
        phone: '+1-555-0102',
        company: 'RetailBrand Co',
        status: 'contacted',
        source: 'linkedin',
        assignedTo: member._id,
        notes: [{ text: 'Interested in Shopify migration. Follow up next week.', createdBy: member._id }],
        activity: [
          { action: 'lead_created', details: { source: 'linkedin' } },
          { action: 'assigned', performedBy: admin._id, details: { assigneeName: member.name } },
          { action: 'status_changed', performedBy: member._id, details: { from: 'new', to: 'contacted' } },
        ],
      },
      {
        name: 'Emily Patel',
        email: 'emily@growthstartup.io',
        phone: '+44-20-7946-0958',
        company: 'GrowthStartup',
        status: 'qualified',
        source: 'referral',
        assignedTo: member._id,
        notes: [
          { text: 'Referred by John at DesignCo. Budget approved for Q3.', createdBy: admin._id },
          { text: 'Had discovery call — needs full rebrand + Shopify store.', createdBy: member._id },
        ],
        activity: [
          { action: 'lead_created', details: { source: 'referral' } },
          { action: 'assigned', performedBy: admin._id, details: { assigneeName: member.name } },
          { action: 'status_changed', performedBy: member._id, details: { from: 'new', to: 'contacted' } },
          { action: 'status_changed', performedBy: member._id, details: { from: 'contacted', to: 'qualified' } },
        ],
      },
      {
        name: 'Marcus Johnson',
        email: 'marcus@bigretail.com',
        phone: '+1-555-0104',
        company: 'BigRetail',
        status: 'proposal',
        source: 'cold_outreach',
        assignedTo: member._id,
        activity: [
          { action: 'lead_created', details: { source: 'cold_outreach' } },
          { action: 'status_changed', performedBy: member._id, details: { from: 'new', to: 'proposal' } },
        ],
      },
      {
        name: 'Lisa Torres',
        email: 'lisa@fashionhouse.com',
        phone: '+61-2-8765-4321',
        company: 'FashionHouse AU',
        status: 'won',
        source: 'event',
        assignedTo: member._id,
        notes: [{ text: 'Signed 12-month retainer. Kickoff scheduled.', createdBy: admin._id }],
        activity: [
          { action: 'lead_created', details: { source: 'event' } },
          { action: 'status_changed', performedBy: member._id, details: { from: 'new', to: 'won' } },
        ],
      },
      {
        name: 'David Kim',
        email: 'david@oldtech.net',
        company: 'OldTech Solutions',
        status: 'lost',
        source: 'website',
        notes: [{ text: 'Budget too low. No fit right now.', createdBy: member._id }],
        activity: [
          { action: 'lead_created', details: { source: 'website' } },
          { action: 'status_changed', performedBy: member._id, details: { from: 'new', to: 'lost' } },
        ],
      },
    ]);

    console.log(`${leads.length} sample leads created`);
    console.log('\nSeed complete. You can now log in with the credentials above.');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
