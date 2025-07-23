import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

const users = sqliteTable('users', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role', { enum: ['admin', 'member'] }).notNull().default('member'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

const teams = sqliteTable('teams', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  leadId: integer('lead_id').references(() => users.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

const members = sqliteTable('members', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role', { enum: ['admin', 'member'] }).notNull().default('member'),
  teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

const schema = { users, teams, members };

const sqlite = new Database('sqlite.db');
const db = drizzle(sqlite, { schema });

async function seed() {
  console.log('🌱 Seeding database...');

  await db.delete(members);
  await db.delete(teams);
  await db.delete(users);

  const adminUser = await db.insert(users).values({
    email: 'admin@demo.com',
    password: 'admin123',
    role: 'admin'
  }).returning();

  const memberUser = await db.insert(users).values({
    email: 'member@demo.com',
    password: 'member123',
    role: 'member'
  }).returning();

  // Create sample teams
  const teamsData = await db.insert(teams).values([
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
  await db.insert(members).values([
    // Development Team
    { name: 'John Doe', email: 'john.doe@company.com', role: 'admin', teamId: teamsData[0].id },
    { name: 'Jane Smith', email: 'jane.smith@company.com', role: 'member', teamId: teamsData[0].id },
    { name: 'Bob Wilson', email: 'bob.wilson@company.com', role: 'member', teamId: teamsData[0].id },
    
    // Design Team
    { name: 'Alice Johnson', email: 'alice.johnson@company.com', role: 'admin', teamId: teamsData[1].id },
    { name: 'Charlie Brown', email: 'charlie.brown@company.com', role: 'member', teamId: teamsData[1].id },
    
    // Marketing Team
    { name: 'Eva Davis', email: 'eva.davis@company.com', role: 'admin', teamId: teamsData[2].id },
    { name: 'Frank Miller', email: 'frank.miller@company.com', role: 'member', teamId: teamsData[2].id },
    { name: 'Grace Lee', email: 'grace.lee@company.com', role: 'member', teamId: teamsData[2].id },
    
    // Sales Team
    { name: 'Henry Taylor', email: 'henry.taylor@company.com', role: 'admin', teamId: teamsData[3].id },
    { name: 'Ivy Wang', email: 'ivy.wang@company.com', role: 'member', teamId: teamsData[3].id },
    
    // HR Team
    { name: 'Jack Chen', email: 'jack.chen@company.com', role: 'admin', teamId: teamsData[4].id },
  ]);

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Created ${teamsData.length} teams and sample members`);
  console.log('🔐 Login credentials:');
  console.log('  Admin: admin@demo.com / admin123');
  console.log('  Member: member@demo.com / member123');
  
  sqlite.close();
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});