# Circuit Console

A beautiful, developer-friendly API dashboard built with Next.js 14, featuring authentication, multi-tenancy, team management, and both user-facing and admin panels.

## 🚀 Features

### Authentication & Security
- **Email/Password Authentication** - No external OAuth dependencies
- **Secure Session Management** - JWT-based sessions with HTTP-only cookies
- **Password Hashing** - bcrypt for secure password storage
- **API Key Management** - Generate, hash, and manage API keys securely
- **Webhook Secrets** - Secure webhook signing secrets (hashed, show once)

### Multi-Tenancy & Teams
- **Organizations** - Full multi-tenant support
- **Role-Based Access Control (RBAC)** - Owner, Admin, Developer, Viewer roles
- **Team Management** - Invite members, manage roles, remove users
- **Invite System** - Token-based invitations with expiration

### Console Features (User-Facing)
- **Overview Dashboard** - Stats, quick start guide, recent activity
- **Projects Management** - Create and organize projects with environments
- **API Keys** - Secure key generation and management
- **Webhooks** - Configure webhook endpoints
- **Integration Logs** - Monitor API requests
- **Usage Analytics** - Track API usage and performance
- **Team Management** - Manage organization members
- **Audit Logs** - Comprehensive activity tracking
- **Settings** - Organization configuration

### Admin Panel (Internal)
- **System Overview** - Platform-wide statistics
- **Matchmaking** - Monitor matchmaking algorithms
- **Algorithm Controls** - Adjust parameters and feature flags
- **Experiments** - Manage A/B tests
- **Customer Management** - View all organizations
- **Status Page** - System health and incident management

### UI/UX
- **Dark Mode by Default** - With theme toggle (localStorage persistence)
- **Beautiful Design** - Calm, modern, developer-friendly aesthetic
- **Responsive Layout** - Works on all screen sizes
- **Command Palette** - Quick navigation (⌘K)
- **Copy Buttons** - Easy copying of IDs, keys, secrets
- **Empty States** - Helpful guidance when getting started
- **Loading Skeletons** - Smooth loading experience

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **Authentication**: JWT + bcrypt
- **Data Storage**: JSON file (dev) / In-memory (Vercel fallback)
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

## 🏃‍♂️ Getting Started

### 1. Install Dependencies

```bash
cd dashboard
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the dashboard directory:

```bash
# Generate a secure secret: openssl rand -base64 32
AUTH_SECRET=your-secure-secret-here

# Admin email allowlist (comma-separated)
ADMIN_EMAIL_ALLOWLIST=admin@circuit.com,admin@example.com

# Optional
MOCK_MODE=false
NODE_ENV=development
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Default Accounts

The system comes with pre-seeded demo accounts:

### Admin Account (Full Access)
- **Email**: `admin@circuit.com`
- **Password**: `password123`
- **Role**: Owner (has admin panel access)

### Developer Account
- **Email**: `dev@circuit.com`
- **Password**: `password123`
- **Role**: Developer

## 📚 How It Works

### Authentication Flow

1. Users sign up with email/password
2. Password is hashed with bcrypt (10 rounds)
3. JWT token is created and stored in HTTP-only cookie
4. Middleware validates token on protected routes
5. Admin routes check email against allowlist

### Data Storage

**Development/Local:**
- Data stored in `./data/dev-store.json`
- File-based persistence with atomic writes
- Automatically initialized with seed data

**Production/Vercel:**
- Falls back to in-memory storage
- Demo mode banner displayed
- Data resets on deployment/restart

### Multi-Tenancy

- Users can belong to multiple organizations
- Each organization has projects, API keys, webhooks
- RBAC enforced at API level:
  - **Owner**: Full control, cannot be removed
  - **Admin**: Can manage team, invite members
  - **Developer**: Can manage projects, keys, webhooks
  - **Viewer**: Read-only access

### Security Features

1. **Password Security**
   - Hashed with bcrypt (never stored plaintext)
   - Minimum 8 characters required

2. **API Key Security**
   - Generated with crypto.getRandomValues
   - Hashed before storage
   - Full key shown only once on creation
   - Only prefix displayed in UI

3. **Session Security**
   - HTTP-only cookies (no JavaScript access)
   - Secure flag in production
   - 7-day expiration
   - Server-side validation

4. **RBAC Enforcement**
   - Server-side permission checks
   - Role hierarchy: owner > admin > developer > viewer
   - Middleware protection on all routes

## 🔍 Project Structure

```
dashboard/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── orgs/         # Organization management
│   │   │   ├── projects/     # Project management
│   │   │   ├── api-keys/     # API key management
│   │   │   ├── team/         # Team & invites
│   │   │   └── invites/      # Invite acceptance
│   │   ├── app/              # User console pages
│   │   ├── admin/            # Admin panel pages
│   │   ├── sign-in/          # Auth pages
│   │   ├── sign-up/
│   │   └── accept-invite/
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── app-shell.tsx     # Main layout shell
│   │   ├── theme-provider.tsx
│   │   ├── copy-button.tsx
│   │   └── empty-state.tsx
│   └── lib/                   # Utilities
│       ├── auth.ts           # Authentication logic
│       ├── data-store.ts     # Data storage layer
│       ├── org-utils.ts      # Organization utilities
│       └── utils.ts          # Helper functions
├── data/                      # Data storage (gitignored)
│   └── dev-store.json
├── public/                    # Static assets
└── ...config files
```

## 🎨 Customization

### Theme Colors

Edit `src/app/globals.css` to customize the color scheme. The design uses CSS variables for easy theming.

### Adding Pages

1. Create page in `src/app/app/` for console or `src/app/admin/` for admin
2. Add route to navigation in `src/components/app-shell.tsx`
3. Create API routes in `src/app/api/` if needed

### Modifying Roles

Edit role definitions and permissions in:
- `src/lib/data-store.ts` (type definitions)
- `src/lib/org-utils.ts` (permission logic)

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm run build
# Deploy via Vercel dashboard or CLI
```

**Note**: On Vercel, the app runs in demo mode with in-memory storage. A banner will inform users that data may reset.

### Other Platforms

Ensure write permissions to the `./data` directory for file-based storage, or the app will automatically fall back to in-memory mode.

## 📝 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AUTH_SECRET` | Yes | - | Secret key for JWT signing |
| `ADMIN_EMAIL_ALLOWLIST` | Yes | - | Comma-separated admin emails |
| `MOCK_MODE` | No | `false` | Enable mock/demo mode |
| `NODE_ENV` | No | `development` | Node environment |

## 🐛 Known Limitations

1. **File Storage on Serverless**: On platforms like Vercel, filesystem writes may not persist between requests. The app handles this gracefully with in-memory fallback.

2. **Email Delivery**: Invites are link-based only (no actual email sending). Copy the invite link and share manually.

3. **Real-time Features**: No WebSocket support. API logs and usage stats use mock data.

4. **Single Organization Context**: The UI shows one org at a time (first in user's list). Full org switcher implementation is basic.

## 🤝 Contributing

This is a demo/template project. Feel free to fork and customize for your needs!

## 📄 License

MIT License - use freely for your projects.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

**Built with ❤️ for developers who appreciate beautiful tools.**

