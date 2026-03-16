# Smart Complaint Portal - Complete Code Documentation

## Project Overview
A role-based complaint management system for educational institutions with AI-powered complaint analysis using Gemini 3 Flash.

## Features
1. **Complaint Submission** - Students can submit complaints with automatic AI analysis
2. **AI Complaint Analysis** - Automatic category detection, priority detection, and summary generation
3. **Status Tracking** - Track complaint status (Pending, In Progress, Resolved)
4. **Admin Dashboard** - View all complaints, update status, and analytics
5. **Duplicate Detection** - AI identifies similar complaints
6. **Analytics** - Category breakdown, priority distribution, location statistics
7. **Role-Based Access** - Student and Admin roles with different permissions

## Tech Stack
- **Backend**: FastAPI, Python 3.9+
- **Database**: MongoDB
- **Frontend**: React 19, Tailwind CSS
- **UI Components**: Shadcn UI (Radix UI)
- **AI Integration**: Gemini 3 Flash via Emergent LLM Key
- **Authentication**: JWT tokens
- **Charts**: Recharts

## Project Structure
```
/app/
├── backend/
│   ├── server.py           # Main FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.js
│   │   │   └── ui/        # Shadcn UI components
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── StudentDashboard.js
│   │   │   └── AdminDashboard.js
│   │   ├── contexts/
│   │   │   └── AuthContext.js
│   │   ├── lib/
│   │   │   └── utils.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env
└── design_guidelines.json
```

## Setup Instructions

### Backend Setup
1. Install dependencies:
   ```bash
   cd /app/backend
   pip install -r requirements.txt
   ```

2. Configure environment variables in `.env`:
   ```
   MONGO_URL="mongodb://localhost:27017"
   DB_NAME="test_database"
   CORS_ORIGINS="*"
   EMERGENT_LLM_KEY=sk-emergent-47aEd1fB2Bd6b81040
   JWT_SECRET=your-secret-key-change-in-production-123456789
   ```

3. Run the server:
   ```bash
   uvicorn server:app --host 0.0.0.0 --port 8001 --reload
   ```

### Frontend Setup
1. Install dependencies:
   ```bash
   cd /app/frontend
   yarn install
   ```

2. Configure environment variables in `.env`:
   ```
   REACT_APP_BACKEND_URL=https://your-app.preview.emergentagent.com
   ```

3. Run the development server:
   ```bash
   yarn start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Complaints
- `POST /api/complaints` - Submit new complaint (protected)
- `GET /api/complaints` - Get user complaints (student) or all complaints (admin)
- `GET /api/complaints/{id}` - Get single complaint
- `PUT /api/complaints/{id}` - Update complaint status (admin only)
- `GET /api/complaints/{id}/duplicates` - Get duplicate complaints

### Analytics
- `GET /api/analytics` - Get complaint analytics (admin only)

## Database Models

### User
```python
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "password": "hashed",
  "role": "student|admin",
  "created_at": "datetime"
}
```

### Complaint
```python
{
  "id": "uuid",
  "student_name": "string",
  "student_id": "uuid",
  "category": "string",
  "location": "string",
  "description": "string",
  "ai_category": "Electrical|Cleaning|Internet|Maintenance|Other",
  "priority": "Low|Medium|High",
  "summary": "string",
  "status": "Pending|In Progress|Resolved",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

## Design System

### Colors
- **Sidebar**: #0F1115 (Dark Charcoal)
- **Main Background**: #F9F9F7 (Warm Beige)
- **Primary/Gold**: #D4A373
- **Card Background**: #FFFFFF

### Typography
- **Headings**: Manrope (Google Fonts)
- **Body**: Inter (Google Fonts)

### Status Colors
- **Pending**: Yellow background (#FEF3C7), Brown text (#92400E)
- **In Progress**: Blue background (#DBEAFE), Blue text (#1E40AF)
- **Resolved**: Green background (#DCFCE7), Green text (#166534)

### Priority Colors
- **Low**: Gray
- **Medium**: Blue
- **High**: Red background (#FEE2E2), Red text (#991B1B)

## AI Integration

The application uses Gemini 3 Flash via Emergent LLM Key for:
1. **Category Detection** - Automatically categorizes complaints
2. **Priority Detection** - Assigns Low/Medium/High priority
3. **Summary Generation** - Creates concise summaries
4. **Duplicate Detection** - Identifies similar complaints

## Testing

### Test Accounts
- **Student**: student@test.com / test123
- **Admin**: admin@test.com / admin123

### Test Scenarios
1. Register and login as student
2. Submit complaints with various categories
3. Verify AI analysis (category, priority, summary)
4. Login as admin
5. View all complaints in admin dashboard
6. Update complaint status
7. Check analytics and charts

## Deployment

The application is deployed on Emergent platform with:
- Backend on port 8001
- Frontend on port 3000
- MongoDB running locally
- Kubernetes ingress routing

## Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
CORS_ORIGINS=*
EMERGENT_LLM_KEY=sk-emergent-47aEd1fB2Bd6b81040
JWT_SECRET=your-secret-key-change-in-production-123456789
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://fixmate-ai-1.preview.emergentagent.com
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
```

## License
MIT License

## Support
For issues or questions, contact the development team.