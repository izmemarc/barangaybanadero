import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'content.db');

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'text',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    path TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS officers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    image_path TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT NOT NULL,
    date TEXT NOT NULL,
    beneficiaries TEXT,
    image_path TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admin_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    password_hash TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS community_services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS community_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS office_hours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day TEXT NOT NULL,
    hours TEXT NOT NULL,
    is_closed BOOLEAN DEFAULT 0,
    order_index INTEGER NOT NULL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS emergency_contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    number TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Initialize default content if empty
const contentCount = db.prepare('SELECT COUNT(*) as count FROM content').get() as { count: number };

if (contentCount.count === 0) {
  const insertContent = db.prepare('INSERT INTO content (key, value, type) VALUES (?, ?, ?)');
  
  insertContent.run('hero_welcome_title', 'Welcome to Barangay 6, Bañadero', 'text');
  insertContent.run('hero_welcome_subtitle', 'Poblacion, Dumaguete City', 'text');
  insertContent.run('hero_captain_name', 'Hon. Hisham M. Macabangkit', 'text');
  insertContent.run('hero_captain_title', 'Barangay Captain', 'text');
  insertContent.run('mission_text', 'With the inspiration and guidance of the Almighty God, we are committed to adopt state-of-the-art technologies, plan and implement programs, projects and activities using the Community Driven Development (CDD) strategy to promptly deliver quality basic services for the total improvement of the barangay.', 'text');
  insertContent.run('vision_text', 'A self-reliant community enjoying a progressive and even-handed economy, disaster resilient, drug-free, well-managed solid wastes, peaceful and ecologically balanced environment with God-loving people guided by a responsive, participatory, transparent and accountable leadership and governance.', 'text');
}

// Initialize default officers if empty
const officersCount = db.prepare('SELECT COUNT(*) as count FROM officers').get() as { count: number };

if (officersCount.count === 0) {
  const insertOfficer = db.prepare('INSERT INTO officers (name, position, image_path, order_index) VALUES (?, ?, ?, ?)');
  
  insertOfficer.run('Hon. Hisham M. Macabangkit', 'Barangay Captain', '/captain.webp', 0);
  insertOfficer.run('Mila S. Macabangkit', 'Barangay Kagawad', '/mila.jpg', 1);
  insertOfficer.run('Hisham M. Macabangkit Jr.', 'SK Chairman', '/hisham.jpg', 2);
}

// Initialize default projects if empty
const projectsCount = db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number };

if (projectsCount.count === 0) {
  const insertProject = db.prepare('INSERT INTO projects (title, subtitle, description, date, beneficiaries, image_path, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)');
  
  // Main Pillars (3)
  insertProject.run(
    'Financial Administration',
    'Barangay Assembly – Second Semester CY 2024',
    'Held on October 26, 2024, the assembly gathered residents and officials to present the financial report, update ongoing projects, and address community concerns through open dialogue and feedback.',
    'October 26, 2024',
    'All residents',
    '/finance.webp',
    0
  );
  
  insertProject.run(
    'Disaster Preparedness',
    'Preemptive Evacuation and Relief Distribution for Typhoon Opong',
    'PB Arthur Marco led the preemptive evacuation of 24 families to ensure safety as Typhoon Opong intensified. Together with Kagawad Regie Ajero, BDRRM Chairman, the barangay council and BHW distributed food packs at the evacuation center.',
    'September 25, 2025',
    '24 evacuated families',
    '/disaster.webp',
    1
  );
  
  insertProject.run(
    'Social Protection',
    'External Accreditation of Barangay 6 Bañadero Child Development Center',
    'External evaluation was conducted to assess and improve the quality of education, ensuring standards for effective learning. Gratitude was extended to the accreditors, Barangay officials, and the Child Development Worker for their support in making the accreditation a success.',
    'September 24, 2025',
    'Children and families',
    '/social protection.webp',
    2
  );
  
  // Supporting Pillars (3)
  insertProject.run(
    'Business-Friendliness and Competitiveness',
    'Empowering Women: Strengthening Lives Through Awareness and Opportunities',
    'A seminar focused on gender advocacy, mental health, conflict resolution, and livelihood opportunities for women in the community.',
    'September 17, 2025',
    'Women in the community',
    '/livelihood.webp',
    3
  );
  
  insertProject.run(
    'Peace and Order',
    'Seminar/Training for Lupon and Tanod – Empowering for a Drug-Free Community',
    'Held on August 24, 2024, at the Barangay Action Center, the training covered the Katarungang Pambarangay Law, drug awareness and prevention, warrantless arrest procedures, and arresting and handcuffing techniques for barangay tanods.',
    'August 24, 2024',
    'Lupon and Tanod members',
    '/peace and order.webp',
    4
  );
  
  insertProject.run(
    'Environmental Management',
    'Seminar on Ecological Waste Segregation and Recycling for Livelihood',
    'A community seminar held at the Barangay Action Center highlighting composting, waste segregation in line with RA 9003, and recycling as livelihood opportunities. Resource speakers from OCENR and ESWMO provided insights, while practical demonstrations showed how waste can be turned into useful and marketable products.',
    'March 8, 2025',
    'Community residents',
    '/environment.webp',
    5
  );
}

// Initialize community services if empty
const servicesCount = db.prepare('SELECT COUNT(*) as count FROM community_services').get() as { count: number };
if (servicesCount.count === 0) {
  const insertService = db.prepare('INSERT INTO community_services (title, description, icon, order_index) VALUES (?, ?, ?, ?)');
  
  insertService.run('Peace & Order', '24/7 security patrol and emergency response services', 'Shield', 0);
  insertService.run('Health Services', 'Free medical consultations and health programs', 'Heart', 1);
  insertService.run('Education Support', 'Scholarship programs and educational assistance', 'GraduationCap', 2);
  insertService.run('Environmental Programs', 'Waste management and environmental protection initiatives', 'Leaf', 3);
}

// Initialize community events if empty
const eventsCount = db.prepare('SELECT COUNT(*) as count FROM community_events').get() as { count: number };
if (eventsCount.count === 0) {
  const insertEvent = db.prepare('INSERT INTO community_events (title, date, time, location, type, order_index) VALUES (?, ?, ?, ?, ?, ?)');
  
  insertEvent.run('Barangay Assembly Meeting', 'March 15, 2024', '7:00 PM', 'Community Center', 'Meeting', 0);
  insertEvent.run('Health and Wellness Fair', 'March 22, 2024', '8:00 AM - 4:00 PM', 'Basketball Court', 'Health', 1);
  insertEvent.run('Environmental Clean-up Drive', 'March 30, 2024', '6:00 AM - 10:00 AM', 'Various Areas', 'Environment', 2);
}

// Initialize office hours if empty
const hoursCount = db.prepare('SELECT COUNT(*) as count FROM office_hours').get() as { count: number };
if (hoursCount.count === 0) {
  const insertHours = db.prepare('INSERT INTO office_hours (day, hours, is_closed, order_index) VALUES (?, ?, ?, ?)');
  
  insertHours.run('Monday - Friday', '8:00 AM - 5:00 PM', 0, 0);
  insertHours.run('Saturday', 'Closed', 1, 1);
  insertHours.run('Sunday', 'Closed', 1, 2);
}

// Initialize emergency contacts - always set to defaults
const defaultContacts = [
  { name: 'Barangay Emergency', number: '0917 555 3323', order_index: 0 },
  { name: 'Medical Emergency', number: '911', order_index: 1 },
  { name: 'Fire Department', number: '09199925484 / 09171859984', order_index: 2 },
  { name: 'UST Hospital', number: '0917 626 3621', order_index: 3 },
  { name: 'BRTTH', number: '(052) 732 5555', order_index: 4 },
  { name: 'Legazpi PNP', number: '09985985926 / 09266256247', order_index: 5 },
  { name: 'Philippine Red Cross - Albay', number: '(052) 742-2199', order_index: 6 },
  { name: 'Mental Health', number: '0917-899-8727', order_index: 7 },
];

// Clear existing contacts and insert defaults
db.prepare('DELETE FROM emergency_contacts').run();
const insertContact = db.prepare('INSERT INTO emergency_contacts (name, number, order_index) VALUES (?, ?, ?)');
defaultContacts.forEach(contact => {
  insertContact.run(contact.name, contact.number, contact.order_index);
});

export default db;

