# Job Application Tracker

A full-featured job application tracking system built with Next.js and Supabase.

## Features

- User authentication system
- Dashboard to track job applications and their statuses
- Company and contact information management
- Interview scheduling with reminders
- Document storage for resumes and cover letters
- Status tracking (Applied, Interview Scheduled, Rejected, Offer, etc.)

## Tech Stack

- **Frontend**: Next.js (App Router) with TypeScript
- **Backend/Database**: Supabase
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Styling**: Tailwind CSS
- **State Management**: React Context or Redux Toolkit
- **Form Handling**: React Hook Form

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Supabase account

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/job-tracker.git
   cd job-tracker
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   ```bash
   cp .env.local.example .env.local
   ```
   
   Then edit `.env.local` with your Supabase credentials.

4. Set up Supabase
   - Create a new Supabase project
   - Execute the SQL queries in `lib/supabase-schema.sql` in the Supabase SQL editor
   - Enable email authentication in the Supabase Auth settings

5. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Deploying to Vercel

1. Push your code to a Git repository (GitHub, GitLab, BitBucket)
2. Import your project in Vercel
3. Add your environment variables in the Vercel project settings
4. Deploy

## License

This project is licensed under the MIT License.
