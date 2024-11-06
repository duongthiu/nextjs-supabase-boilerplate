# Next.js Supabase Boilerplate

Thanks for checking out this repository! This project is a fork from the original [MVP Boilerplate](https://github.com/devtodollars/mvp-boilerplate).

## Purpose

This Next.js Supabase boilerplate provides a solid foundation for building scalable web applications.

## Tech Stack

- **Next.js**: A React framework for building server-rendered applications with ease.
- **Supabase**: An open-source Firebase alternative that provides a backend as a service, including authentication, database, and storage.
- **TypeScript**: A superset of JavaScript that adds static types, enhancing code quality and maintainability.
- **Tailwind CSS**: A utility-first CSS framework for creating custom designs without leaving your HTML.

## Features

- 🔐 Authentication with Supabase
- 📱 Responsive layout with Tailwind CSS
- 🏗️ Type-safe database operations
- 🚀 Server-side rendering with Next.js
- ⚡ API routes for backend functionality

## Getting Started

1. [Install node](https://nodejs.org/en/download)
2. Clone and setup the project:

```bash
git clone https://github.com/phamvuhoang/nextjs-supabase-boilerplate.git
cd nextjs-supabase-boilerplate
```

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Install dependencies and start development:

```bash
npm install
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

6. **Optional: Set Up Supabase Database**:
   - Navigate to your Supabase project dashboard
   - Go to the SQL editor
   - Upload and run the `schema.sql` file to create the necessary tables

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── account/           # Account management pages
│   └── ...               # Other pages
├── components/            # Reusable React components
│   ├── landing/          # Landing page components
│   └── layout/           # Layout components
├── utils/                 # Utility functions
│   └── supabase/         # Supabase related utilities
├── types/                 # TypeScript type definitions
└── public/               # Static assets
```

## Environment Variables

Required environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```