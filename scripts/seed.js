const { drizzle } = require('drizzle-orm/better-sqlite3');
const Database = require('better-sqlite3');

const schema = require('../src/db/schema');

const sqlite = new Database('sqlite.db');
const db = drizzle(sqlite, { schema });

async function seed() {
  console.log('🌱 Seeding database...');

  const adminUser = await db.insert(schema.users).values({
    email: 'admin@demo.com',
    password: 'admin123',
    role: 'admin'
  }).returning();

  const memberUser = await db.insert(schema.users).values({
    email: 'member@demo.com',
    password: 'member123',
    role: 'member'
  }).returning();

  // Create sample teams
  const teams = await db.insert(schema.teams).values([
    {
      name: 'Development Team',
      description: 'Responsible for product development and engineering',
      leadId: adminUser[0].id
    },
    {
      name: 'Design Team',
      description: 'UI/UX design and user experience',
      leadId: adminUser[0].id
    },
    {
      name: 'Marketing Team',
      description: 'Marketing and growth initiatives',
      leadId: memberUser[0].id
    },
    {
      name: 'Sales Team',
      description: 'Sales and customer relations',
      leadId: memberUser[0].id
    },
    {
      name: 'HR Team',
      description: 'Human resources and talent management',
      leadId: adminUser[0].id
    }
  ]).returning();

  // Create sample members
  await db.insert(schema.members).values([
    // Development Team
    { name: 'John Doe', email: 'john.doe@company.com', role: 'admin', teamId: teams[0].id },
    { name: 'Jane Smith', email: 'jane.smith@company.com', role: 'member', teamId: teams[0].id },
    { name: 'Bob Wilson', email: 'bob.wilson@company.com', role: 'member', teamId: teams[0].id },
    
    // Design Team
    { name: 'Alice Johnson', email: 'alice.johnson@company.com', role: 'admin', teamId: teams[1].id },
    { name: 'Charlie Brown', email: 'charlie.brown@company.com', role: 'member', teamId: teams[1].id },
    
    // Marketing Team
    { name: 'Eva Davis', email: 'eva.davis@company.com', role: 'admin', teamId: teams[2].id },
    { name: 'Frank Miller', email: 'frank.miller@company.com', role: 'member', teamId: teams[2].id },
    { name: 'Grace Lee', email: 'grace.lee@company.com', role: 'member', teamId: teams[2].id },
    
    // Sales Team
    { name: 'Henry Taylor', email: 'henry.taylor@company.com', role: 'admin', teamId: teams[3].id },
    { name: 'Ivy Wang', email: 'ivy.wang@company.com', role: 'member', teamId: teams[3].id },
    
    // HR Team
    { name: 'Jack Chen', email: 'jack.chen@company.com', role: 'admin', teamId: teams[4].id },
  ]);

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Created ${teams.length} teams and sample members`);
  console.log('🔐 Login credentials:');
  console.log('  Admin: admin@demo.com / admin123');
  console.log('  Member: member@demo.com / member123');
  
  sqlite.close();
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});