# Quick Setup Guide

Follow these steps to get Circuit Console running locally in under 5 minutes.

## Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)

## Step 1: Install Dependencies

```bash
cd dashboard
npm install
```

This will install all required packages including Next.js, React, TailwindCSS, and more.

## Step 2: Environment Configuration

The project already includes a `.env.local` file with defaults for development. You can modify it if needed:

```bash
# .env.local (already created)
AUTH_SECRET=dev-secret-key-change-in-production-123456789
ADMIN_EMAIL_ALLOWLIST=admin@circuit.com,test@circuit.com
MOCK_MODE=false
NODE_ENV=development
```

**Important for Production**: Generate a secure `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

## Step 3: Run Development Server

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

## Step 4: Sign In

Use one of the pre-configured demo accounts:

### Admin Account (Full Access + Admin Panel)
- **Email**: admin@circuit.com
- **Password**: password123

### Developer Account (Standard Access)
- **Email**: dev@circuit.com  
- **Password**: password123

## What You Can Do

### As Admin User:
1. ✅ Access the main Console at `/app/overview`
2. ✅ Create projects and environments
3. ✅ Generate API keys (secure, show-once)
4. ✅ Manage team members and invitations
5. ✅ View audit logs
6. ✅ Access Admin Panel at `/admin/overview`

### As Developer User:
1. ✅ Access the Console
2. ✅ Create projects
3. ✅ Generate API keys
4. ✅ View team members (but can't manage them)
5. ❌ No admin panel access

## Creating a New Account

1. Visit [http://localhost:3000/sign-up](http://localhost:3000/sign-up)
2. Enter your details
3. You'll be auto-signed in and redirected to the Console
4. The system will create a new organization for you

**Note**: New accounts won't have admin panel access unless you add their email to `ADMIN_EMAIL_ALLOWLIST`.

## Testing Features

### Creating a Project
1. Go to **Projects** in the sidebar
2. Click "New Project"
3. Enter a name and submit
4. Two environments are created automatically: Sandbox and Production

### Generating API Keys
1. Go to **API Keys** in the sidebar
2. Click "Create API Key"
3. Select project and environment
4. **Copy the key immediately** - it won't be shown again!

### Inviting Team Members
1. Go to **Team** in the sidebar
2. Click "Invite Member"
3. Enter email and select role
4. Copy the invite link and share it
5. The recipient can click the link to join your organization

### Accessing Admin Panel
1. Sign in with an admin email (admin@circuit.com)
2. Click "Admin Panel" in the sidebar
3. Explore system-wide stats and controls

## Data Storage

In development, data is stored in `./data/dev-store.json`. This file is created automatically when you first run the app.

**View your data:**
```bash
cat data/dev-store.json | jq  # if you have jq installed
# or
cat data/dev-store.json
```

**Reset to defaults:**
```bash
rm data/dev-store.json
# Restart the dev server - it will recreate with seed data
```

## Project Structure Overview

```
dashboard/
├── src/
│   ├── app/               # Pages and API routes
│   │   ├── api/          # Backend API endpoints
│   │   ├── app/          # User console pages
│   │   ├── admin/        # Admin panel pages
│   │   └── (auth pages)
│   ├── components/        # React components
│   └── lib/              # Core logic & utilities
├── data/                  # Data storage (gitignored)
└── ...config files
```

## Common Issues

### Port 3000 already in use
```bash
# Use a different port
PORT=3001 npm run dev
```

### Can't access admin panel
- Make sure you're signed in with an email in `ADMIN_EMAIL_ALLOWLIST`
- Default admin email: admin@circuit.com

### Data not persisting
- Check if `./data/` directory exists and is writable
- Look for console warnings about storage mode
- In production (Vercel), this is expected - see README.md

### TypeScript errors
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

## Next Steps

1. **Customize the UI**: Edit `src/app/globals.css` for theme colors
2. **Add more pages**: Create new pages in `src/app/app/`
3. **Extend the API**: Add routes in `src/app/api/`
4. **Deploy**: See README.md for deployment instructions

## Need Help?

- Check the full [README.md](./README.md) for detailed documentation
- Review the code - it's well-commented and organized
- Inspect API routes in `src/app/api/` to understand the backend

---

Enjoy building with Circuit Console! 🚀

