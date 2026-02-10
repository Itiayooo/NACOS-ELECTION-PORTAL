# NACOS Voting System

A full-stack electronic voting system for the National Association of Computing Students (NACOS) College of Computing Sciences elections.

## Features

### User Features
- ✅ Student registration and authentication
- ✅ Secure voting interface with candidate photos
- ✅ College-level and department-level voting
- ✅ Real-time vote validation
- ✅ Digital voting receipt with download option
- ✅ Beautiful, responsive UI with NACOS green theme

### Admin Features
- ✅ Complete election management dashboard
- ✅ Department management (add/edit/delete)
- ✅ Office/position management
- ✅ Candidate management with photo uploads
- ✅ Real-time election statistics
- ✅ Results viewing with vote counts
- ✅ Election activation/deactivation controls
- ✅ Department-wise voter turnout analytics

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary (for image uploads)
- bcryptjs (password hashing)

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Zustand (state management)
- React Router DOM
- Framer Motion (animations)
- Axios
- React Hot Toast (notifications)
- Lucide React (icons)

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create .env file (copy from .env.example):
```bash
cp .env.example .env
```

4. Update .env with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nacos-voting
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=development

# Cloudinary (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin credentials
ADMIN_EMAIL=admin@nacos.com
ADMIN_PASSWORD=changeme123
```

5. Start MongoDB (if not running):
```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

6. Run the backend:
```bash
npm run dev
```

The backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create .env file (optional):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Run the frontend:
```bash
npm run dev
```

The frontend will run on http://localhost:3000

## Database Seeding

To populate the database with initial data:

1. Create a seed script (`backend/src/seed.ts`):

```typescript
import mongoose from 'mongoose';
import Department from './models/Department';
import Office from './models/Office';
import User from './models/User';
import ElectionSettings from './models/ElectionSettings';
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nacos-voting');
    
    // Clear existing data
    await Department.deleteMany({});
    await Office.deleteMany({});
    await ElectionSettings.deleteMany({});
    
    // Create departments
    const departments = await Department.insertMany([
      { name: 'Computer Science', shortName: 'CS', isActive: true },
      { name: 'Information Technology', shortName: 'IT', isActive: false },
      { name: 'Software Engineering', shortName: 'SE', isActive: false },
      { name: 'Cybersecurity', shortName: 'CYB', isActive: false },
      { name: 'Data Science', shortName: 'DS', isActive: false }
    ]);
    
    const csDept = departments[0];
    
    // Create college-level offices
    const collegeOffices = [
      'President', 'Vice President', 'General Secretary',
      'Assistant General Secretary', 'Welfare Director',
      'Financial Secretary', 'Social Director',
      'Sports Director', 'Public Relations Officer'
    ];
    
    await Office.insertMany(
      collegeOffices.map((title, index) => ({
        title,
        level: 'college',
        isActive: true,
        order: index
      }))
    );
    
    // Create department-level offices (for CS only)
    const deptOffices = [
      'President', 'Vice President', 'General Secretary',
      'Assistant General Secretary', 'Welfare Director',
      'Financial Secretary', 'Social Director',
      'Sports Director', 'Public Relations Officer'
    ];
    
    await Office.insertMany(
      deptOffices.map((title, index) => ({
        title,
        level: 'department',
        department: csDept._id,
        isActive: true,
        order: index
      }))
    );
    
    // Create admin user
    const admin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!admin) {
      await User.create({
        studentId: 'ADMIN001',
        email: process.env.ADMIN_EMAIL || 'admin@nacos.com',
        password: process.env.ADMIN_PASSWORD || 'changeme123',
        fullName: 'System Administrator',
        department: csDept._id,
        isAdmin: true
      });
    }
    
    // Create election settings
    await ElectionSettings.create({
      isElectionActive: false,
      allowedDepartments: [csDept._id],
      resultVisibility: 'hidden'
    });
    
    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
```

2. Add seed script to package.json:
```json
"scripts": {
  "seed": "ts-node src/seed.ts"
}
```

3. Run the seed:
```bash
npm run seed
```

## Usage

### Admin Flow
1. Login with admin credentials (admin@nacos.com / changeme123)
2. Navigate to Admin Dashboard
3. Set up departments, offices, and candidates
4. Upload candidate photos
5. Activate the election
6. Monitor voting progress and view results

### Student Flow
1. Register with student ID, email, and department
2. Login to the voting page
3. Vote for candidates in each position
4. Submit votes
5. View and download voting receipt

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/profile` - Get user profile

### Voting
- GET `/api/vote/data` - Get voting data
- POST `/api/vote/cast` - Cast votes
- GET `/api/vote/receipt` - Get voting receipt

### Admin
- GET/POST/PUT/DELETE `/api/admin/departments` - Manage departments
- GET/POST/PUT/DELETE `/api/admin/offices` - Manage offices
- GET/POST/PUT/DELETE `/api/admin/candidates` - Manage candidates
- GET `/api/admin/results` - View results
- GET `/api/admin/statistics` - View statistics
- GET/PUT `/api/admin/settings` - Manage election settings

## Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes (authentication + authorization)
- Vote integrity (one vote per student per position)
- Admin-only routes

## Contributing
This is a project for NACOS FUNAAB. For contributions or issues, please contact the development team.

## License
MIT License

## Support
For support, contact: admin@nacos.com
