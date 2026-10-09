import Department from './models/Department';
import Office from './models/Office';
import User from './models/User';
import ElectionSettings from './models/ElectionSettings';
import { CollegeEligibility, DepartmentEligibility } from './models/Eligibility';
import { connectDB } from './config/database';
import dotenv from 'dotenv';

dotenv.config();

const officeTitles = [
  'President',
  'Vice President',
  'General Secretary',
  'Assistant General Secretary',
  'Welfare Director',
  'Financial Secretary',
  'Social Director',
  'Sports Director',
  'Public Relations Officer',
];

const seedDatabase = async () => {
  try {
    await connectDB();

    await Department.deleteMany({});
    await Office.deleteMany({});
    await User.deleteMany({});
    await ElectionSettings.deleteMany({});
    await CollegeEligibility.deleteMany({});
    await DepartmentEligibility.deleteMany({});

    const departments = await Department.insertMany([
      { name: 'Computer Science', shortName: 'CSC', isActive: true },
      { name: 'Cybersecurity', shortName: 'CYB', isActive: true },
      { name: 'Data Science', shortName: 'DTS', isActive: true },
      { name: 'Information Technology', shortName: 'IT', isActive: true },
      { name: 'Information Communication Technology', shortName: 'ICT', isActive: true },
      { name: 'Software Engineering', shortName: 'SEN', isActive: true },
      { name: 'Information Systems', shortName: 'IFS', isActive: true },
    ]);

    const [csDept, cybDept, dsDept, itDept, ictDept, seDept, isDept] = departments;

    await CollegeEligibility.insertMany([
      { studentId: '20224578', email: 'student1@nacos.com', fullName: 'John Doe' },
      { studentId: '20225121', email: 'student2@nacos.com', fullName: 'Jane Smith' },
      { studentId: '20235634', email: 'student3@nacos.com', fullName: 'Bob Johnson' },
      { studentId: '20214387', email: 'student4@nacos.com', fullName: 'Alice Williams' },
      { studentId: '20236102', email: 'student5@nacos.com', fullName: 'Sam Smith' },
      { studentId: '20227845', email: 'student6@nacos.com', fullName: 'Grace Okafor' },
      { studentId: '20243319', email: 'student7@nacos.com', fullName: 'David Adeyemi' },
      { studentId: '20256317', email: 'student8@nacos.com', fullName: 'Fatima Bello' },
    ]);

    await Office.insertMany(
      officeTitles.map((title, index) => ({
        title,
        level: 'college',
        isActive: true,
        order: index,
      }))
    );

    await Office.insertMany(
      officeTitles.map((title, index) => ({
        title,
        level: 'department',
        department: csDept._id,
        isActive: true,
        order: index,
      }))
    );

    await User.create({
      studentId: 'ADMIN001',
      email: 'admin@nacos.com',
      password: 'changeme123',
      fullName: 'System Administrator',
      department: csDept._id,
      isAdmin: true,
    });

    const students = [
      { studentId: '20224578', email: 'student1@nacos.com', fullName: 'John Doe', department: csDept._id },
      { studentId: '20225121', email: 'student2@nacos.com', fullName: 'Jane Smith', department: itDept._id },
      { studentId: '20235634', email: 'student3@nacos.com', fullName: 'Bob Johnson', department: seDept._id },
      { studentId: '20214387', email: 'student4@nacos.com', fullName: 'Alice Williams', department: cybDept._id },
      { studentId: '20227845', email: 'student6@nacos.com', fullName: 'Grace Okafor', department: ictDept._id },
      { studentId: '20243319', email: 'student7@nacos.com', fullName: 'David Adeyemi', department: isDept._id },
      { studentId: '20256317', email: 'student8@nacos.com', fullName: 'Fatima Bello', department: dsDept._id },
    ];

    for (const student of students) {
      await User.create({ ...student, password: 'password123' });
    }

    await DepartmentEligibility.insertMany(
      students.map((s) => ({ studentId: s.studentId, department: s.department }))
    );

    await ElectionSettings.create({
      isElectionActive: false,
      allowedDepartments: departments.map((d) => d._id),
      resultVisibility: 'hidden',
    });

    console.log('Seeded.');
    console.log('Admin: admin@nacos.com / changeme123');
    console.log('Students: student1@nacos.com ... student8@nacos.com (no student5) / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();