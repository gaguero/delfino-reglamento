# Quick Start Guide

## Prerequisites

1. Install Node.js 18+ from https://nodejs.org
2. Install PostgreSQL 14+ from https://www.postgresql.org/download/

## Setup Steps

### 1. Database Setup (Local PostgreSQL)

#### Windows (using psql):
```bash
# Start PostgreSQL (if not running)
# Open psql as postgres user

# Create database
CREATE DATABASE delfino_reglamento;

# Create user (optional)
CREATE USER delfino_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE delfino_reglamento TO delfino_user;
```

### 2. Configure Environment Variables

Edit `.env` file:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/delfino_reglamento?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-here"
NODE_ENV="development"
```

To generate a secure secret:
```bash
openssl rand -base64 32
```

Or use any random 32+ character string.

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Database Migrations

```bash
npx prisma migrate dev --name init
```

This will:
- Create all database tables
- Generate Prisma Client
- Apply the schema to your database

### 5. Seed Database

```bash
npx prisma db seed
```

This creates:
- Reference types (Voto, Acta, Ley)
- Annotation types (Contexto, Jurisprudencia, Nota Editorial)
- Master user account
- Sample articles and annotations

### 6. Start Development Server

```bash
npm run dev
```

Visit:
- **Public site**: http://localhost:3000
- **Admin login**: http://localhost:3000/admin/login

### 7. Login to Admin Panel

Default credentials:
- **Email**: gagueromesen@gmail.com
- **Password**: ChangeMe2024!

⚠️ **IMPORTANT**: Change this password immediately after first login!

## Verify Installation

1. Homepage should show sample articles
2. Click on an article to see its content and annotations
3. Navigate to /admin/login and sign in
4. Admin dashboard should show statistics

## Development Tools

### Prisma Studio (Database GUI)
```bash
npx prisma studio
```

Opens at http://localhost:5555 - browse and edit database visually.

### View Database Schema
```bash
npx prisma db pull
```

### Generate Prisma Client (after schema changes)
```bash
npx prisma generate
```

## Common Issues & Solutions

### Issue: Database connection failed
**Solution**: Check that PostgreSQL is running and credentials in .env are correct.

### Issue: Migration errors
**Solution**: Drop and recreate database:
```sql
DROP DATABASE delfino_reglamento;
CREATE DATABASE delfino_reglamento;
```
Then re-run migrations.

### Issue: Prisma Client not found
**Solution**: Run `npx prisma generate`

### Issue: Auth errors on login
**Solution**: Ensure NEXTAUTH_SECRET is set in .env

## Next Steps After Setup

1. **Test the application**:
   - Browse public articles
   - Login to admin
   - View dashboard statistics

2. **Import real data**:
   - Create data migration script
   - Parse reglamentoasambleacr.html
   - Bulk import articles and annotations

3. **Build remaining features**:
   - Annotation editor
   - User management
   - Audit log viewer

4. **Deploy to Railway**:
   - Follow DEPLOYMENT.md guide (to be created)

## Useful Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Production build
npm run start                  # Start production server

# Database
npx prisma studio              # Database GUI
npx prisma migrate dev         # Create migration
npx prisma migrate reset       # Reset database
npx prisma db seed             # Seed data
npx prisma generate            # Generate client

# Git
git status                     # Check changes
git add -A                     # Stage all
git commit -m "message"        # Commit
git push                       # Push to remote
```

## GitHub Setup

After gh CLI authentication:
```bash
gh repo create delfino-reglamento --public --source=. --push
```

Or manually:
1. Create repo at github.com
2. Add remote: `git remote add origin <url>`
3. Push: `git push -u origin master`

## Support

- Prisma Docs: https://www.prisma.io/docs
- Next.js Docs: https://nextjs.org/docs
- Auth.js Docs: https://authjs.dev
- TipTap Docs: https://tiptap.dev
