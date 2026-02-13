import mongoose from 'mongoose';
import Department from './models/Department';
import Office from './models/Office';
import User from './models/User';
import ElectionSettings from './models/ElectionSettings';
import { CollegeEligibility, DepartmentEligibility } from './models/Eligibility';
import { connectDB } from './config/database';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Starting database seed...');

    // COMPLETELY CLEAR ALL COLLECTIONS
    console.log('Clearing all data...');
    await Department.deleteMany({});
    await Office.deleteMany({});
    await User.deleteMany({});
    await ElectionSettings.deleteMany({});
    await CollegeEligibility.deleteMany({});
    await DepartmentEligibility.deleteMany({});
    console.log('All data cleared');

    // Create departments - ALL ACTIVE
    console.log('Creating departments...');
    const departments = await Department.insertMany([
      { name: 'Computer Science', shortName: 'CSC', isActive: true },
      { name: 'Information Technology and Information Communication Technology', shortName: 'ICITSA', isActive: true },
      { name: 'Software Engineering and Information Systems', shortName: 'SENIFSA', isActive: true },
      { name: 'Cybersecurity and Data Science', shortName: 'CYDASSA', isActive: true }      
    ]);
    console.log(`Created ${departments.length} departments`);

    const [csDept, itDept, seDept, cybDept] = departments;

    // Create college-level eligibility
    console.log('Creating college eligibility list...');
    await CollegeEligibility.insertMany([
      { studentId: 'CS/2020/001', email: 'student1@nacos.com', fullName: 'John Doe' },
      { studentId: 'IT/2020/001', email: 'student2@nacos.com', fullName: 'Jane Smith' },
      { studentId: 'SE/2020/001', email: 'student3@nacos.com', fullName: 'Bob Johnson' },
      { studentId: 'CYB/2020/001', email: 'student4@nacos.com', fullName: 'Alice Williams' }      
    ]);
    console.log('Created college eligibility list');

    // Create college-level offices
    console.log('Creating college offices...');
    const collegeOfficesTitles = [
      'President', 'Vice President', 'General Secretary',
      'Assistant General Secretary', 'Welfare Director',
      'Financial Secretary', 'Social Director',
      'Sports Director', 'Public Relations Officer'
    ];

    await Office.insertMany(
      collegeOfficesTitles.map((title, index) => ({
        title,
        level: 'college',
        isActive: true,
        order: index
      }))
    );
    console.log(`Created ${collegeOfficesTitles.length} college offices`);

    // Create department offices for CS
    console.log('Creating CS department offices...');
    const deptOfficesTitles = [
      'President', 'Vice President', 'General Secretary',
      'Assistant General Secretary', 'Welfare Director',
      'Financial Secretary', 'Social Director',
      'Sports Director', 'Public Relations Officer'
    ];

    await Office.insertMany(
      deptOfficesTitles.map((title, index) => ({
        title,
        level: 'department',
        department: csDept._id,
        isActive: true,
        order: index
      }))
    );
    console.log(`Created ${deptOfficesTitles.length} CS department offices`);

    // Create admin user
    console.log('Creating admin user...');
    await User.create({
      studentId: 'ADMIN001',
      email: 'admin@nacos.com',
      password: 'changeme123',
      fullName: 'System Administrator',
      department: csDept._id,
      isAdmin: true
    });
    console.log('Admin created: admin@nacos.com / changeme123');

    // Create sample students
    console.log('Creating sample students...');
    const students = [
      { studentId: 'CS/2020/001', email: 'student1@nacos.com', password: 'password123', fullName: 'John Doe', department: csDept._id },
      { studentId: 'IT/2020/001', email: 'student2@nacos.com', password: 'password123', fullName: 'Jane Smith', department: itDept._id },
      { studentId: 'SE/2020/001', email: 'student3@nacos.com', password: 'password123', fullName: 'Bob Johnson', department: seDept._id },
      { studentId: 'CYB/2020/001', email: 'student4@nacos.com', password: 'password123', fullName: 'Alice Williams', department: cybDept._id }      
    ];

    for (const student of students) {
      await User.create(student);
    }
    console.log(`Created ${students.length} sample students`);

    // Add students to department eligibility
    console.log('Adding students to department eligibility...');
    await DepartmentEligibility.insertMany([
      { studentId: 'CS/2020/001', department: csDept._id },
      { studentId: 'IT/2020/001', department: itDept._id },
      { studentId: 'SE/2020/001', department: seDept._id },
      { studentId: 'CYB/2020/001', department: cybDept._id }
    ]);
    console.log('Added students to department eligibility');

    // Create election settings
    console.log('Creating election settings...');
    await ElectionSettings.create({
      isElectionActive: false,
      allowedDepartments: departments.map(d => d._id),
      resultVisibility: 'hidden'
    });
    console.log('Election settings created');

    console.log('\nDatabase seeded successfully!\n');
    console.log('   Login Credentials:');
    console.log('   Admin: admin@nacos.com / changeme123');
    console.log('   CS Student: student1@nacos.com / password123');
    console.log('   IT Student: student2@nacos.com / password123');
    console.log('   SE Student: student3@nacos.com / password123');
    console.log('   CYB Student: student4@nacos.com / password123\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();