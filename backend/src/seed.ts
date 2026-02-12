import mongoose from 'mongoose';
import Department from './models/Department';
import Office from './models/Office';
import User from './models/User';
import ElectionSettings from './models/ElectionSettings';
import { connectDB } from './config/database';
import dotenv from 'dotenv';
import { CollegeEligibility, DepartmentEligibility } from './models/Eligibility';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Starting database seed...');

    // Clear existing data
    console.log('Clearing existing data...');
    await Department.deleteMany({});
    await Office.deleteMany({});
    await ElectionSettings.deleteMany({});

    // Create departments
    console.log('Creating departments...');
    const departments = await Department.insertMany([
      { name: 'Computer Science', shortName: 'CS', isActive: true },
      { name: 'Information Technology and Information Communication Technology', shortName: 'IT & ICT', isActive: false },
      { name: 'Software Engineering and Information Systems', shortName: 'SE & IS', isActive: false },
      { name: 'Cybersecurity', shortName: 'CYB', isActive: false },
      { name: 'Data Science', shortName: 'DS', isActive: false }
    ]);

    const csDept = departments[0];
    console.log(`Created ${departments.length} departments`);

    // Clear eligibility lists
    console.log('Creating eligibility lists...');
    await CollegeEligibility.deleteMany({});
    await DepartmentEligibility.deleteMany({});

    // Create college-level eligibility (can access platform)
    const collegeEligibleStudents = [
      { studentId: 'CS/2020/001', email: 'student1@nacos.com', fullName: 'John Doe' },
      { studentId: 'CS/2020/002', email: 'student2@nacos.com', fullName: 'Jane Smith' },
      { studentId: 'CS/2020/003', email: 'student3@nacos.com', fullName: 'Bob Johnson' },
      { studentId: 'CS/2020/004', email: 'student4@nacos.com', fullName: 'Alice Williams' },
      { studentId: 'CS/2020/005', email: 'student5@nacos.com', fullName: 'Charlie Brown' },
      { studentId: 'CS/2020/006', email: 'student6@nacos.com', fullName: 'Big Daddy' }
    ];

    await CollegeEligibility.insertMany(collegeEligibleStudents);
    console.log(`Created ${collegeEligibleStudents.length} college-eligible students`);

    // Create department-level eligibility (can vote in department elections)    


    // Create college-level offices
    console.log('Creating college-level offices...');
    const collegeOfficesTitles = [
      'President',
      'Vice President',
      'General Secretary',
      'Assistant General Secretary',
      'Welfare Director',
      'Financial Secretary',
      'Social Director',
      'Sports Director',
      'Public Relations Officer'
    ];

    const collegeOffices = await Office.insertMany(
      collegeOfficesTitles.map((title, index) => ({
        title,
        level: 'college',
        isActive: true,
        order: index
      }))
    );
    console.log(`Created ${collegeOffices.length} college-level offices`);

    // Create department-level offices (for CS only)
    console.log('Creating department-level offices for Computer Science...');
    const deptOfficesTitles = [
      'President',
      'Vice President',
      'General Secretary',
      'Assistant General Secretary',
      'Welfare Director',
      'Financial Secretary',
      'Social Director',
      'Sports Director',
      'Public Relations Officer'
    ];

    const deptOffices = await Office.insertMany(
      deptOfficesTitles.map((title, index) => ({
        title,
        level: 'department',
        department: csDept._id,
        isActive: true,
        order: index
      }))
    );
    console.log(`Created ${deptOffices.length} department-level offices`);

    // Create admin user
    console.log('Creating admin user...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nacos.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      await User.create({
        studentId: 'ADMIN001',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'changeme123',
        fullName: 'System Administrator',
        department: csDept._id,
        isAdmin: true
      });
      console.log(`Created admin user (${adminEmail})`);
    } else {
      console.log('Admin user already exists');
    }

    // Create some sample students for testing
    console.log('Creating sample students...');
    const sampleStudents = [
      {
        studentId: 'CS/2020/001',
        email: 'student1@nacos.com',
        password: 'password123',
        fullName: 'John Doe',
        department: csDept._id,        
      },
      {
        studentId: 'CS/2020/002',
        email: 'student2@nacos.com',
        password: 'password123',
        fullName: 'Jane Smith',
        department: csDept._id,        
      },
      {
        studentId: 'CS/2020/003',
        email: 'student3@nacos.com',
        password: 'password123',
        fullName: 'Bob Johnson',
        department: csDept._id,        
      },
      {
        studentId: 'CS/2020/004',
        email: 'student4@nacos.com',
        password: 'password123',
        fullName: 'Alice Williams',
        department: csDept._id,        
      }
    ];

    for (const student of sampleStudents) {
      const existing = await User.findOne({ email: student.email });
      if (!existing) {
        await User.create(student);
      }
    }
    console.log(`Created sample students`);

    // Create election settings
    console.log('Creating election settings...');
    await ElectionSettings.create({
      isElectionActive: false,
      allowedDepartments: [csDept._id],
      resultVisibility: 'hidden'
    });
    console.log('Created election settings');

    console.log('\n Database seeded successfully!');
    console.log('\n Login Credentials:');
    console.log(`   Admin: ${adminEmail} / ${process.env.ADMIN_PASSWORD || 'changeme123'}`);
    console.log('   Student: student1@nacos.com / password123');
    console.log('\n Remember to:');
    console.log('   1. Change default passwords');
    console.log('   2. Add candidates with photos from admin panel');
    console.log('   3. Activate election when ready');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
