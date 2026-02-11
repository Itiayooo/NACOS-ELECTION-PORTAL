# NACOS Voting System - Quick Start Guide

##  What You Have

A complete, production-ready electronic voting system with:

###  Features
- **Student Portal**: Registration, login, voting, digital receipt
- **Admin Dashboard**: Full election management system
- **Beautiful UI**: NACOS green & white theme, smooth animations
- **Secure**: JWT authentication, password hashing, vote integrity
- **Real-time**: Live statistics, results tracking
- **Photo Support**: Candidate photos via Cloudinary

##  Project Structure

```
nacos-voting-system/
├── backend/              # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── models/      # Database models
│   │   ├── controllers/ # Business logic
│   │   ├── routes/      # API endpoints
│   │   ├── middleware/  # Auth & validation
│   │   ├── config/      # Database config
│   │   ├── utils/       # Image upload utils
│   │   ├── server.ts    # Main server file
│   │   └── seed.ts      # Database seeder
│   ├── package.json
│   └── .env.example
│
└── frontend/            # React + TypeScript + Tailwind
    ├── src/
    │   ├── pages/       # Login, Register, Voting, Admin
    │   ├── components/  # Reusable UI components
    │   ├── store/       # Zustand state management
    │   ├── services/    # API calls
    │   ├── types/       # TypeScript types
    │   └── App.tsx      # Main app with routing
    ├── package.json
    └── index.html
```

## ⚡ Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in another terminal)
cd frontend
npm install
```

### 2. Setup Environment

```bash
# In backend folder
cp .env.example .env

# Edit .env and set:
# - MONGODB_URI (your MongoDB connection string)
# - JWT_SECRET (any random secure string)
# - Cloudinary credentials (or use placeholder images)
```

### 3. Start MongoDB

```bash
# Make sure MongoDB is running
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
# Windows: net start MongoDB
```

### 4. Seed Database

```bash
# In backend folder
npm run seed

# This creates:
# - 5 departments (CS active, others inactive)
# - 18 offices (9 college + 9 department)
# - Admin user: admin@nacos.com / changeme123
# - Sample students for testing
```

### 5. Start Applications

```bash
# Terminal 1 - Backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 - Frontend (http://localhost:3000)
cd frontend
npm run dev
```

## 🎯 Using the System

### As Admin (admin@nacos.com / changeme123)

1. **Login** → Auto-redirect to Admin Dashboard
2. **Departments** → Manage departments (add/edit/delete)
3. **Offices** → Manage positions (college & department level)
4. **Candidates** → Add candidates with photos
   - Name, photo, position, manifesto
   - Upload real photos or use placeholder URLs
5. **Settings** → Activate election when ready
6. **Results** → View vote counts in real-time
7. **Overview** → Monitor voter turnout & statistics

### As Student (student1@nacos.com / password123)

1. **Register** → Create account with student ID
2. **Login** → Access voting page
3. **Vote** → Select one candidate per position
   - College positions (9)
   - Department positions (9 for CS students)
4. **Submit** → Cast all votes at once
5. **Receipt** → View & download voting confirmation

## 🎨 Design Features

### UI/UX
- NACOS green (#16a34a) & white theme
- Smooth animations with Framer Motion
- Responsive design (mobile-friendly)
- Glass-morphism cards
- Real-time feedback with toast notifications

### User Flow
- Clean, intuitive navigation
- Progress indicators
- Validation feedback
- Disabled states prevent errors
- Confirmation dialogs for critical actions

## 🔐 Security

- **Authentication**: JWT tokens, 7-day expiry
- **Authorization**: Admin-only routes protected
- **Passwords**: bcrypt hashed (10 rounds)
- **Vote Integrity**: One vote per student per position
- **Data Validation**: Backend validation for all inputs

## 📊 Data Models

1. **User**: Students & admins
2. **Department**: Academic departments
3. **Office**: Electoral positions
4. **Candidate**: People running for office
5. **Vote**: Recorded votes (anonymous after submission)
6. **ElectionSettings**: Control panel

## 🛠 Customization

### Change Theme Colors
Edit `frontend/tailwind.config.js`:
```javascript
colors: {
  nacos: {
    green: { ... } // Your colors here
  }
}
```

### Add More Departments
Use admin panel or seed script

### Add Features
- Email notifications (add nodemailer)
- SMS voting codes (add Twilio)
- Live results (add WebSockets)
- Export reports (add PDF generation)

## 📱 Tech Stack Highlights

**Backend**
- Express.js (REST API)
- MongoDB (NoSQL database)
- Mongoose (ODM)
- JWT (authentication)
- Cloudinary (image hosting)
- TypeScript (type safety)

**Frontend**
- React 18 (UI library)
- TypeScript (type safety)
- Tailwind CSS (styling)
- Zustand (state management)
- React Router (navigation)
- Framer Motion (animations)
- Axios (HTTP client)

## 🐛 Troubleshooting

**"Cannot connect to MongoDB"**
- Ensure MongoDB is running
- Check MONGODB_URI in .env

**"Token invalid"**
- Clear localStorage
- Login again

**"Failed to upload image"**
- Check Cloudinary credentials
- Or use image URLs instead

**"Port already in use"**
- Change PORT in backend .env
- Update VITE_API_URL in frontend

## 📝 Next Steps

1. **Add Real Candidates**
   - Upload actual student photos
   - Add manifestos
   
2. **Test Voting Flow**
   - Register multiple test students
   - Vote with different accounts
   - Verify one-vote-per-position
   
3. **Go Live**
   - Activate election from settings
   - Share registration link with students
   - Monitor turnout in admin dashboard
   
4. **After Election**
   - Deactivate voting
   - Export results
   - Share with students

## 🆘 Support

- Backend runs on: http://localhost:5000
- Frontend runs on: http://localhost:3000
- API docs: See README.md for all endpoints

## 🎓 For Development

```bash
# Run tests (add tests first!)
npm test

# Build for production
npm run build

# Deploy to cloud
# - Backend: Heroku, Railway, Render
# - Frontend: Vercel, Netlify
# - Database: MongoDB Atlas
```

## ✅ Ready to Use!

Your system is now ready. The code is production-quality with proper error handling, validation, and security. Just add your candidates and you're good to go!

Happy voting! 🗳️
