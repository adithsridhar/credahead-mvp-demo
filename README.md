# CredAhead MVP - Financial Literacy Platform

A comprehensive financial literacy platform built with Next.js 14, featuring adaptive assessments and personalized learning experiences. Currently deployed at [https://credahead-mvp-demo.netlify.app](https://credahead-mvp-demo.netlify.app).

## Current Status (Production-Ready Features)

✅ **Active Features**:
- User Registration & Authentication
- Initial Financial Literacy Assessment (24 questions)
- Admin Dashboard with Analytics
- Database Management & User Tracking
- Responsive Design for Mobile/Desktop

🚧 **Development Features** (Feature-flagged):
- Learning Pathway System
- Lesson Content & Quizzes
- Advanced Progress Tracking

## Expected User Experience Flow

### 1. **Landing & Registration**
```
Landing Page → Sign Up → Email Confirmation → Auto Login
```
- Users land on the homepage with clear value proposition
- Simple sign-up form with email/password
- Email confirmation redirects to production app (not localhost)
- Automatic login after confirmation

### 2. **Initial Assessment**
```
Welcome → Pre-Assessment Info → 24-Question Assessment → Results
```
- **Pre-Assessment Screen**: Explains the assessment purpose and format
- **Adaptive Assessment**: 24 questions starting at difficulty level 5
  - Correct answers: Difficulty +0.5
  - Incorrect answers: Difficulty -1.0
  - Questions span 8 financial literacy modules
- **Progress Tracking**: Real-time progress bar and difficulty indicator
- **Results Screen**: 
  - "Assessment Completed!" + "🎉 Congratulations!!"
  - Large literacy level score (1-10)
  - Statistics: Questions Correct, Accuracy, Percentile ranking
  - Continue button to return to main menu

### 3. **Main Menu & Navigation**
```
Assessment Results → Main Menu → Feature Access
```
- Clean navigation with user's literacy level displayed
- Access to available features based on current build
- Admin access for authorized users

### 4. **Admin Experience** (For Administrators)
```
Admin Login → Dashboard → Analytics & Management
```
- Secure admin authentication
- Real-time analytics showing:
  - Total users, lessons, questions, scores
  - User registration trends
  - Assessment completion rates
- User management interface
- Data import/export capabilities

## Features

### Core Assessment System
- **Adaptive Algorithm**: Dynamic difficulty adjustment based on performance
- **Comprehensive Coverage**: 8 financial literacy modules
- **Real-time Feedback**: Immediate scoring and percentile calculation
- **Session Management**: 5-minute inactivity timeout with session recovery

### User Management
- **Secure Authentication**: Supabase Auth with email confirmation
- **Profile Management**: Literacy level tracking and progress history
- **Data Privacy**: Row Level Security (RLS) implementation

### Admin Dashboard
- **Analytics**: User engagement and assessment completion metrics
- **User Overview**: Detailed user list with registration and assessment status
- **Data Management**: Secure access to user data and system statistics

## Technology Stack

- **Frontend**: Next.js 14 with App Router, TypeScript
- **UI Framework**: Material-UI with custom dark theme
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Query + Zustand
- **Deployment**: Netlify with environment variable fallbacks
- **Analytics**: Built-in user tracking and percentile calculations

## Quick Start

### Prerequisites

- Node.js 18+ 
- A Supabase account and project

### 1. Clone and Install

```bash
git clone https://github.com/adithsridhar/credahead-mvp-demo.git
cd credahead-mvp-demo
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTAUTH_SECRET=your_random_secret_string
NEXTAUTH_URL=http://localhost:3000
```

### 3. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database/schema.sql`
4. Run the SQL script to create all tables, indexes, and policies

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── assessment/         # Assessment module (ACTIVE)
│   ├── pathway/           # Learning pathway (FEATURE-FLAGGED)
│   ├── lesson/[lessonId]/ # Dynamic lesson routes (FEATURE-FLAGGED)
│   ├── auth/              # Authentication pages (ACTIVE)
│   ├── admin/             # Admin dashboard (ACTIVE)
│   └── api/               # API routes (ACTIVE)
├── components/            # Reusable UI components
├── contexts/              # React contexts (Auth, Navigation)
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── cache/            # Caching logic
│   ├── utils/            # Helper functions
│   └── featureFlags.ts   # Production/Development feature separation
└── types/                 # TypeScript type definitions
```

## Feature Flag System

The application uses a feature flag system to separate production-ready features from development features:

### Production Features (Always Active)
- User Authentication & Registration
- Initial Assessment System
- Admin Dashboard & Analytics
- User Profile Management

### Development Features (Currently Disabled)
- Learning Pathway System
- Lesson Content & Quizzes
- Advanced Progress Tracking

Toggle features in `src/lib/featureFlags.ts`.

## Assessment Algorithm

### Difficulty Progression
- **Starting Point**: Level 5 (medium difficulty)
- **Correct Answer**: +0.5 difficulty
- **Incorrect Answer**: -1.0 difficulty
- **Range**: 1-10 difficulty scale

### Scoring System
- **Literacy Level**: Calculated based on final difficulty and accuracy
- **Percentile Ranking**: Compared against 1000+ historical scores
- **Performance Tracking**: Real-time progress updates

## Deployment

### Netlify (Current Production)

The app is deployed at: **https://credahead-mvp-demo.netlify.app**

**Deployment Features**:
- Automatic GitHub integration
- Environment variable management
- Runtime configuration fallbacks
- Production build optimization

### Local Build

```bash
npm run build
npm run start
```

### Build Commands

```bash
npm run build        # Production build
npm run dev         # Development server
npm run lint        # ESLint checking
npm run type-check  # TypeScript validation
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for admin operations | Yes |
| `NEXTAUTH_SECRET` | Random string for session encryption | Yes |
| `NEXTAUTH_URL` | Your application URL | Yes |

## Database Schema

### Core Tables
- `users` - User profiles and literacy levels
- `modules` - Financial literacy modules (8 total)
- `lessons` - Course content with level progression
- `questions` - Assessment questions with difficulty ratings
- `user_question_history` - Question attempt tracking
- `quiz_sessions` - Assessment session management
- `scores` - Historical score data for percentile calculations

### Key Features
- Row Level Security (RLS) for data protection
- Automatic user creation triggers
- Performance indexes on frequently queried columns
- Referential integrity with foreign keys

## API Routes

- `GET /api/admin/stats` - Admin dashboard analytics
- `POST /api/admin/login` - Admin authentication
- `POST /api/scores/percentile` - Percentile calculation
- `GET /api/debug` - Production debugging (temporary)

## Performance Optimizations

- **Server Components**: Static content rendered server-side
- **Client Components**: Interactive elements only
- **Runtime Configuration**: Fallback system for environment variables
- **Caching**: Multi-layer caching strategy with React Query
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js automatic optimization

## Security Features

- **Row Level Security**: Database-level access control
- **Admin Authentication**: Secure admin route protection
- **Session Management**: Automatic timeout and secure storage
- **Environment Protection**: Safe handling of sensitive keys
- **CORS Protection**: Proper API route security

## Current Issues & Solutions

### Resolved Issues
- ✅ Module performance calculation (fixed database relationships)
- ✅ Netlify environment variable loading (runtime config fallback)
- ✅ Admin dashboard data access (service role key fallback)
- ✅ Assessment UI consistency (uniform sizing)
- ✅ Production build optimization (TypeScript fixes)

### Known Considerations
- Email confirmation redirects (configure Supabase URL settings for production)
- Feature flag management (easy toggle for enabling development features)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
1. Check the GitHub issues
2. Create a new issue with detailed description
3. Include error logs and environment details

## License

This project is licensed under the MIT License.

## Roadmap

### Phase 1 (Current - MVP)
- ✅ Core assessment system with adaptive difficulty
- ✅ User authentication and profile management
- ✅ Admin dashboard with analytics
- ✅ Production deployment with Netlify
- ✅ Mobile-responsive design

### Phase 2 (Next - Learning Platform)
- 🔄 Learning pathway system activation
- 🔄 Lesson content and interactive quizzes
- 🔄 Advanced progress tracking and analytics
- 🔄 Content management interface

### Phase 3 (Future - Advanced Features)
- 📋 AI-powered question generation
- 📋 Social learning features and community
- 📋 Gamification elements and achievements
- 📋 Multi-language support
- 📋 Mobile app development
- 📋 Integration with external financial tools

---

**Live Demo**: [https://credahead-mvp-demo.netlify.app](https://credahead-mvp-demo.netlify.app)

**Admin Demo**: Available upon request for authorized users