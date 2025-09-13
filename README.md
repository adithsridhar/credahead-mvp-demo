# CredAhead MVP - Financial Literacy Platform

A comprehensive financial literacy platform built with Next.js 14, featuring adaptive assessments and personalized learning pathways.

## Features

- **Adaptive Assessment**: 24-question assessment that adjusts difficulty based on user performance
- **Personalized Learning Pathway**: Level-based progression system with prerequisite requirements
- **Lesson Quizzes**: 10-question quizzes with real-time feedback and explanations
- **User Progress Tracking**: Comprehensive progress monitoring with caching
- **Admin Dashboard**: CSV import functionality and analytics
- **Session Management**: Automatic session timeout and progress preservation

## Technology Stack

- **Frontend**: Next.js 14 with App Router, TypeScript
- **UI Framework**: Material-UI with custom theming
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Query for server state, Zustand for client state
- **Authentication**: Supabase Auth
- **Caching**: React Query + localStorage for user history

## Quick Start

### Prerequisites

- Node.js 18+ 
- A Supabase account and project

### 1. Clone and Install

```bash
git clone <repository-url>
cd credahead-mvp
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
│   ├── assessment/         # Assessment module
│   ├── pathway/           # Learning pathway
│   ├── lesson/[lessonId]/ # Dynamic lesson routes
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin dashboard
│   └── api/               # API routes
├── components/            # Reusable UI components
├── contexts/              # React contexts (Auth)
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── cache/            # Caching logic
│   └── utils/            # Helper functions
└── types/                 # TypeScript type definitions
```

## Key Components

### Assessment System
- **Location**: `src/app/assessment/`
- **Features**: Pre-assessment screen, adaptive difficulty, 24 questions
- **Algorithm**: Starts at difficulty 5, adjusts +0.5 for correct, -1.0 for incorrect

### Learning Pathway
- **Location**: `src/app/pathway/`
- **Features**: Level-based progression, prerequisite checking, completion tracking
- **Access Control**: Users must complete current level to access next level

### Lesson Quizzes
- **Location**: `src/app/lesson/[lessonId]/`
- **Features**: 10 questions per lesson, feedback popups, passing score of 8/10
- **Feedback**: 10-second timer before allowing continuation

### Admin Dashboard
- **Location**: `src/app/admin/`
- **Features**: CSV import, analytics, user management
- **Import**: Supports both lessons and questions via CSV upload

## Data Import

### CSV Format

**Lessons CSV Headers:**
```
lesson_id,title,description,level,estimated_duration,prerequisites
```

**Questions CSV Headers:**
```
question_id,lesson_id,text,options,correct_answer,difficulty,explanation
```

**Example Question Row:**
```csv
q_001,lesson_001,"What is budgeting?","[\"Planning expenses\",\"Spending money\",\"Saving only\",\"Investing\"]",0,3,"Budgeting is the process of planning how to spend your money."
```

### Import Process
1. Navigate to `/admin`
2. Select import type (lessons or questions)
3. Choose CSV file
4. Click upload

## Caching Strategy

### User History Cache
- **Purpose**: Prevents duplicate questions in assessments/quizzes
- **Storage**: Memory cache + localStorage persistence
- **Duration**: 5 minutes for memory, persistent for localStorage
- **Invalidation**: Automatic on new sessions

### React Query Cache
- **Server State**: 1 minute stale time, 5 minutes garbage collection
- **User Progress**: Cached and invalidated on updates
- **Lessons/Questions**: Long-term caching with background refetch

## Authentication Flow

1. **Sign Up**: Creates Supabase auth user + custom user record
2. **Sign In**: Validates credentials and loads user profile
3. **Assessment**: Required before accessing learning pathway
4. **Progress Tracking**: Real-time updates to user literacy level

## Deployment

### Vercel (Recommended)

1. Push to GitHub repository
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Build

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for admin operations | Yes |
| `NEXTAUTH_SECRET` | Random string for session encryption | Yes |
| `NEXTAUTH_URL` | Your application URL | Yes |

## API Routes

- `POST /api/admin/import` - CSV data import
- Authentication handled by Supabase

## Database Schema

### Core Tables
- `users` - User profiles and literacy levels
- `lessons` - Course content with level progression
- `questions` - Quiz questions with difficulty ratings
- `user_progress` - Lesson completion tracking
- `user_question_history` - Question attempt history
- `quiz_sessions` - Active quiz session management

### Key Features
- Row Level Security (RLS) for data protection
- Automatic user creation trigger
- Performance indexes on frequently queried columns
- Referential integrity with foreign keys

## Performance Optimizations

- **Server Components**: Static content rendered server-side
- **Client Components**: Interactive elements only
- **Image Optimization**: Next.js automatic optimization
- **Caching**: Multi-layer caching strategy
- **Code Splitting**: Automatic route-based splitting
- **Bundle Analysis**: Built-in webpack analyzer

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

### Phase 1 (Current)
- ✅ Core assessment and learning system
- ✅ Basic admin dashboard
- ✅ CSV import functionality

### Phase 2 (Future)
- Advanced analytics and reporting
- Content management interface
- Mobile app development
- Integration with external learning resources

### Phase 3 (Future)
- AI-powered question generation
- Social learning features
- Gamification elements
- Multi-language support