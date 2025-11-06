import { pool } from '../config/database';
import bcrypt from 'bcrypt';

async function seed() {
  try {
    console.log('Seeding database...');

    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Admin user
    await pool.query(
      `INSERT INTO users (email, password_hash, role, name, phone)
       VALUES ($1, $2, $3, $4, $5)`,
      ['admin@campus.edu', hashedPassword, 'admin', 'Admin User', '555-0001']
    );

    // Reporter users
    await pool.query(
      `INSERT INTO users (email, password_hash, role, name, phone)
       VALUES ($1, $2, $3, $4, $5)`,
      ['reporter1@campus.edu', hashedPassword, 'reporter', 'Sarah Reporter', '555-0002']
    );

    await pool.query(
      `INSERT INTO users (email, password_hash, role, name, phone)
       VALUES ($1, $2, $3, $4, $5)`,
      ['reporter2@campus.edu', hashedPassword, 'reporter', 'Mike Reporter', '555-0003']
    );

    // Driver users
    await pool.query(
      `INSERT INTO users (email, password_hash, role, name, phone)
       VALUES ($1, $2, $3, $4, $5)`,
      ['driver1@campus.edu', hashedPassword, 'driver', 'John Driver', '555-0004']
    );

    await pool.query(
      `INSERT INTO users (email, password_hash, role, name, phone)
       VALUES ($1, $2, $3, $4, $5)`,
      ['driver2@campus.edu', hashedPassword, 'driver', 'Emma Driver', '555-0005']
    );

    // Partner user
    await pool.query(
      `INSERT INTO users (email, password_hash, role, name, phone)
       VALUES ($1, $2, $3, $4, $5)`,
      ['partner@shelter.org', hashedPassword, 'partner', 'Community Shelter', '555-0006']
    );

    console.log('✓ Users created');

    // Create test partners
    await pool.query(
      `INSERT INTO partners (organization_name, address, latitude, longitude, contact_name, contact_phone, contact_email, operating_hours, food_preferences, current_need_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        'Downtown Community Shelter',
        '123 Main St, Campus City, ST 12345',
        40.7128,
        -74.0060,
        'Jane Smith',
        '555-1001',
        'jane@shelter.org',
        'Mon-Sun: 8am-8pm',
        'All types welcome',
        'high'
      ]
    );

    await pool.query(
      `INSERT INTO partners (organization_name, address, latitude, longitude, contact_name, contact_phone, contact_email, operating_hours, food_preferences, current_need_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        'Hope House',
        '456 Oak Ave, Campus City, ST 12345',
        40.7589,
        -73.9851,
        'Bob Johnson',
        '555-1002',
        'bob@hopehouse.org',
        'Mon-Fri: 9am-6pm',
        'Vegetarian preferred',
        'medium'
      ]
    );

    await pool.query(
      `INSERT INTO partners (organization_name, address, latitude, longitude, contact_name, contact_phone, contact_email, operating_hours, food_preferences, current_need_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        'Campus Food Bank',
        '789 University Dr, Campus City, ST 12345',
        40.7484,
        -73.9857,
        'Maria Garcia',
        '555-1003',
        'maria@campusfoodbank.org',
        'Mon-Sat: 10am-7pm',
        'All types, especially packaged foods',
        'high'
      ]
    );

    console.log('✓ Partners created');

    // Create sample events
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(18, 0, 0, 0);

    await pool.query(
      `INSERT INTO events (title, location, latitude, longitude, start_time, end_time, expected_attendees, food_type, catering_company)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        'Alumni Conference Luncheon',
        'Student Center Ballroom',
        40.7300,
        -73.9950,
        tomorrow,
        new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
        150,
        'Buffet style: sandwiches, salads, desserts',
        'Campus Catering Services'
      ]
    );

    await pool.query(
      `INSERT INTO events (title, location, latitude, longitude, start_time, end_time, expected_attendees, food_type, catering_company)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        'Faculty Meeting Dinner',
        'Administration Building Room 301',
        40.7350,
        -74.0000,
        nextWeek,
        new Date(nextWeek.getTime() + 2 * 60 * 60 * 1000),
        50,
        'Italian catering: pasta, salad, bread',
        'Bella Italia Catering'
      ]
    );

    console.log('✓ Events created');

    console.log('\n========================================');
    console.log('Database seeded successfully!');
    console.log('========================================');
    console.log('\nTest Accounts (password: password123):');
    console.log('  Admin:     admin@campus.edu');
    console.log('  Reporter:  reporter1@campus.edu');
    console.log('  Reporter:  reporter2@campus.edu');
    console.log('  Driver:    driver1@campus.edu');
    console.log('  Driver:    driver2@campus.edu');
    console.log('  Partner:   partner@shelter.org');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
