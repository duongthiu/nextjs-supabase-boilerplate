# Next.js Supabase Boilerplate

Thanks for checking out this repository! This project is a fork from the original [MVP Boilerplate](https://github.com/devtodollars/mvp-boilerplate).

## Purpose

This Next.js Supabase boilerplate provides a solid foundation for building scalable web applications

## Tech Stack

- **Next.js**: A React framework for building server-rendered applications with ease.
- **Supabase**: An open-source Firebase alternative that provides a backend as a service, including authentication, database, and storage.
- **TypeScript**: A superset of JavaScript that adds static types, enhancing code quality and maintainability.
- **Tailwind CSS**: A utility-first CSS framework for creating custom designs without leaving your HTML.

## Getting Started

1. [Install node](https://nodejs.org/en/download)
2. In your terminal, run the following commands:

```bash
git clone https://github.com/phamvuhoang/nextjs-supabase-boilerplate.git
cd nextjs-supabase-boilerplate
```

3. Use .env.example to create .env file

```bash
cp .env.example .env
```

4. Install dependencies and run the development server

```bash
npm install
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

6. **Set Up Supabase Database**:
   - Navigate to your Supabase project dashboard.
   - Go to the SQL editor.
   - Upload and run the `schema.sql` file to create the necessary tables in your Supabase database.

```bash
-- Example command to run schema.sql
\i path/to/schema.sql
```

Make sure to replace `path/to/schema.sql` with the actual path to your `schema.sql` file.
