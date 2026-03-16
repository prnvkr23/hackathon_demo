# 🚀 Quick Start Guide - Smart Complaint Portal

## 📍 Project Location
```
/app/project_code_complete/
```

## 📋 What's Included

### Documentation (3 files)
- `README.md` - Complete documentation
- `PROJECT_STRUCTURE.md` - Detailed architecture
- `FILE_MANIFEST.txt` - Complete file listing
- `QUICK_START.md` - This guide

### Backend (3 files)
- `backend/server.py` - Complete FastAPI application (545 lines)
- `backend/requirements.txt` - Python dependencies
- `backend/.env.example` - Environment variables template

### Frontend (13 files)
- Configuration: `package.json`, `tailwind.config.js`, `.env.example`
- Main: `src/App.js`, `src/index.css`, `src/App.css`
- Components: `src/components/Sidebar.js`
- Contexts: `src/contexts/AuthContext.js`
- Pages: `src/pages/LoginPage.js`, `StudentDashboard.js`, `AdminDashboard.js`
- Utils: `src/lib/utils.js`

**Total: 20 files ready to use!**

## ⚡ Quick Setup

### Option 1: Use in Current Environment (Already Running!)
The app is already deployed and running at:
- **Frontend**: https://fixmate-ai-1.preview.emergentagent.com
- **Backend API**: https://fixmate-ai-1.preview.emergentagent.com/api

Test accounts:
- **Student**: `student@test.com` / `test123`
- **Admin**: `admin@test.com` / `admin123`

### Option 2: Copy to Local Machine

1. **Copy the folder:**
   ```bash
   cp -r /app/project_code_complete ~/my-complaint-portal
   cd ~/my-complaint-portal
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your values
   uvicorn server:app --host 0.0.0.0 --port 8001 --reload
   ```

3. **Frontend Setup (new terminal):**
   ```bash
   cd frontend
   yarn install
   
   # Install Shadcn UI components:
   npx shadcn-ui@latest add button
   npx shadcn-ui@latest add input
   npx shadcn-ui@latest add label
   npx shadcn-ui@latest add card
   npx shadcn-ui@latest add badge
   npx shadcn-ui@latest add textarea
   npx shadcn-ui@latest add tabs
   npx shadcn-ui@latest add sonner
   
   cp .env.example .env
   # Edit .env with your backend URL
   yarn start
   ```

4. **Access:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001
   - API Docs: http://localhost:8001/docs

## 🎯 Key Features

✅ **Authentication**
- Role-based (Student & Admin)
- JWT tokens with bcrypt

✅ **AI-Powered Analysis**
- Gemini 3 Flash integration
- Auto-categorization
- Priority detection
- Summary generation

✅ **Student Features**
- Submit complaints
- View personal history
- Track status
- See AI analysis

✅ **Admin Features**
- View all complaints
- Update status
- Analytics dashboard
- Charts (Bar & Pie)
- Location tracking

✅ **UI/UX**
- Modern warm aesthetic
- Responsive design
- Toast notifications
- Status badges
- Real-time updates

## 📊 Tech Stack

**Backend:**
- FastAPI (Python web framework)
- MongoDB (Database)
- Gemini 3 Flash (AI)
- JWT (Authentication)
- Motor (Async MongoDB driver)

**Frontend:**
- React 19
- Tailwind CSS
- Shadcn UI (Radix UI)
- Recharts (Charts)
- React Router (Routing)
- Axios (HTTP client)
- Sonner (Toasts)

## 🔐 Environment Variables

### Backend `.env`
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
CORS_ORIGINS=*
EMERGENT_LLM_KEY=sk-emergent-47aEd1fB2Bd6b81040
JWT_SECRET=your-secret-key-change-in-production
```

### Frontend `.env`
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Complaints
- `POST /api/complaints` - Submit complaint
- `GET /api/complaints` - Get complaints
- `GET /api/complaints/{id}` - Get single complaint
- `PUT /api/complaints/{id}` - Update status (admin)
- `GET /api/complaints/{id}/duplicates` - Find duplicates

### Analytics
- `GET /api/analytics` - Get analytics (admin only)

## 🧪 Testing

1. **Register Accounts:**
   - Go to register tab
   - Create student account
   - Create admin account

2. **Test Student Flow:**
   - Login as student
   - Submit a complaint (e.g., "Fan broken in room 204")
   - Check AI category, priority, summary
   - View complaint history

3. **Test Admin Flow:**
   - Login as admin
   - View all complaints in table
   - Update complaint status
   - Check analytics dashboard
   - View charts

## 🎨 Design System

**Colors:**
- Sidebar: #0F1115 (Dark Charcoal)
- Background: #F9F9F7 (Warm Beige)
- Primary: #D4A373 (Gold)
- Card: #FFFFFF (White)

**Typography:**
- Headings: Manrope (600 weight)
- Body: Inter (400 weight)

**Status Colors:**
- Pending: Yellow
- In Progress: Blue
- Resolved: Green

**Priority Colors:**
- Low: Gray
- Medium: Blue
- High: Red

## 📁 File Structure

```
project_code_complete/
├── README.md
├── PROJECT_STRUCTURE.md
├── FILE_MANIFEST.txt
├── QUICK_START.md
│
├── backend/
│   ├── server.py
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    ├── .env.example
    │
    └── src/
        ├── App.js
        ├── App.css
        ├── index.css
        ├── components/Sidebar.js
        ├── contexts/AuthContext.js
        ├── pages/
        │   ├── LoginPage.js
        │   ├── StudentDashboard.js
        │   └── AdminDashboard.js
        └── lib/utils.js
```

## 💡 Tips

1. **MongoDB**: Make sure MongoDB is running before starting backend
2. **Ports**: Backend uses 8001, Frontend uses 3000
3. **CORS**: Set correct origins in production
4. **JWT Secret**: Change in production
5. **Emergent LLM Key**: Already provided for Gemini 3 Flash
6. **Shadcn UI**: Don't forget to install UI components

## 🐛 Troubleshooting

**Backend won't start:**
- Check MongoDB is running: `sudo systemctl status mongod`
- Check port 8001 is free: `lsof -i :8001`
- Check all dependencies installed: `pip list`

**Frontend won't start:**
- Check node_modules installed: `ls node_modules`
- Check port 3000 is free: `lsof -i :3000`
- Clear cache: `rm -rf node_modules && yarn install`

**AI not working:**
- Check EMERGENT_LLM_KEY is set in backend .env
- Check backend logs for errors
- Verify emergentintegrations is installed

## 📞 Support

For issues or questions:
1. Check README.md for detailed docs
2. Check PROJECT_STRUCTURE.md for architecture
3. Check FILE_MANIFEST.txt for file details
4. Review backend logs: `tail -f /var/log/supervisor/backend.err.log`
5. Review frontend logs in browser console

## 🎉 You're All Set!

The complete Smart Complaint Portal is ready to use. All files are organized and documented. Copy the folder or use it directly from `/app/project_code_complete/`.

Happy coding! 🚀
