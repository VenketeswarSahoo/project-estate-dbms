# Estate Manager

Estate Manager is a role-based estate inventory and administration web application. It gives administrators and estate teams a place to manage clients, estate items, related people, communications, and item identification in one dashboard.

## Features

- Role-aware dashboard for `ADMIN`, `AGENT`, `EXECUTOR`, `BENEFICIARY`, and `CLIENT` users.
- Client and estate inventory management, including item descriptions, piece counts, photos, barcode/UID values, and locked status.
- Item list and detail views, filtering, search, image galleries, and PDF barcode output.
- Camera barcode scanning with a manual identifier entry option.
- User management for clients, agents, executors, and beneficiaries.
- Messages and item-related conversations, plus notifications and optional email delivery.
- Supabase Storage uploads for item photos and user avatars, with MongoDB persistence for their URLs.
- Responsive dashboard UI, theme support, charts, and table/grid views.

## Technology

- Next.js 16 App Router, React 19, TypeScript
- MongoDB with Mongoose
- JWT cookie authentication and bcrypt password hashing
- Supabase Storage for uploaded item photos and avatars
- Tailwind CSS 4, Radix UI, shadcn-style components
- TanStack Query and Table, React Hook Form, Zod
- Nodemailer, jsPDF, JsBarcode, html5-qrcode

## Requirements

- Node.js compatible with Next.js 16 (Node.js 20.9 or later recommended)
- npm
- A MongoDB database
- A Supabase project with a public Storage bucket (default bucket name: `estate-files`)
- SMTP credentials if the app should send email

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` in the project root and configure the Supabase, SMTP, and app URL values used by this project:

   ```dotenv
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   SUPABASE_SECRET_KEY=
   SUPABASE_STORAGE_BUCKET=estate-files

   NEXT_PUBLIC_APP_URL=http://localhost:3000

   SMTP_HOST=
   SMTP_PORT=587
   SMTP_USER=
   SMTP_PASS=
   SMTP_FROM=
   ```

   The database connection reads `MONGO_URI` (or `MONGODB_URI`) from the environment. Create the Storage bucket named by `SUPABASE_STORAGE_BUCKET` in the Supabase dashboard and make it public so saved image URLs can be displayed. Keep `SUPABASE_SECRET_KEY` server-only. The JWT signing secret is still hardcoded in `src/lib/utils/jwt.ts`; move it to a server-only environment variable and rotate any credentials that have been exposed before deploying. Do not commit secrets.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

Available scripts:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the local development server |
| `npm run build` | Build the production application |
| `npm run start` | Serve a production build |
| `npm run lint` | Run ESLint |

## Application workflow

1. **Sign in.** The login page submits an email and password to `POST /api/auth/login`. The server checks the stored bcrypt hash and issues a seven-day JWT in the `auth_token` HTTP-only cookie. The proxy checks this cookie for dashboard and API routes and redirects unauthenticated users to `/`.
2. **Open the dashboard.** Summary cards and recent activity are populated from users, items, and messages. Navigation and available actions vary by role.
3. **Manage the estate people.** Administrators can create and manage client records and associate executors and beneficiaries. Agents, executors, and beneficiaries have their own user lists and role-appropriate views.
4. **Record estate items.** An item belongs to a client and can include a name, description, number of pieces, photos, barcode, UID, lock state, and optional disposition action (`SALE`, `DISTRIBUTE`, `DONATE`, or `OTHER`). Item APIs persist records in MongoDB; photos upload to Supabase Storage through the authenticated `/api/uploads` endpoint and the resulting URLs are saved with the item. User avatars use the same upload path.
5. **Identify items.** Item barcodes can be displayed or exported in PDFs. The scan controls use the camera to find an item by barcode; a user can also enter an identifier manually.
6. **Communicate and follow up.** Users can send messages to recipients allowed by the UI's role filters. Messages and notifications are stored in MongoDB; email notifications are sent when SMTP is configured.

## Main routes

| Route | Purpose |
| --- | --- |
| `/` | Sign-in page |
| `/dashboard` | Overview and recent activity |
| `/dashboard/items` | Estate inventory |
| `/dashboard/items/new` | Create an item |
| `/dashboard/items/[id]` | Item detail, edits, and barcode output |
| `/dashboard/clients` | Client management |
| `/dashboard/agents` | Agent management |
| `/dashboard/executors` | Executor management |
| `/dashboard/beneficiaries` | Beneficiary management |
| `/dashboard/messages` | Message inbox and conversations |
| `/dashboard/settings` | User settings |

## API overview

- `POST /api/auth/login`, `POST /api/auth/logout` — session sign-in and sign-out.
- `GET|POST /api/items`, `GET|PATCH|DELETE /api/items/[id]` — inventory records.
- `GET|POST /api/users`, `GET|PATCH|DELETE /api/users/[id]` — user records; `GET /api/users?role=...` filters by role.
- `GET|POST /api/messages`, `/api/messages/[itemId]` — message operations.
- `GET /api/notifications`, `POST /api/notifications/create` — notification operations.
- `POST /api/uploads` — authenticated Supabase Storage uploads; submit multipart fields `file` and `category` (`items`, `avatars`, or `files`). The current UI uses the item photo and avatar categories; `files` accepts PDFs through the API.
- `GET /api/admin/create` — currently contains a development admin bootstrap that creates `admin@estate.com` with a default password if no such account exists.

## Project layout

```text
src/
  app/             App Router pages and API route handlers
  components/      Dashboard, forms, tables, messaging, barcode, and UI components
  hooks/           UI and upload hooks
  lib/             Database, auth, query hooks, email, and PDF helpers
  models/          Mongoose schemas for users, items, messages, and notifications
  providers/       React Query and theme providers
  server/          Server-side notification helpers
  store/           Zustand application and sidebar state
  types/           Shared TypeScript types
  utility/         Shared formatting helpers
```

## Security and configuration notes

- Keep the MongoDB URI in a server-only environment variable and rotate any credentials that have been exposed. Move the JWT secret from source code into a server-only environment variable; it must be long and unique per environment.
- The admin bootstrap endpoint uses a predictable default account (`admin@estate.com` / `password123`) and is reachable as an API route. Remove it or protect it before deploying, and change default credentials immediately.
- The route proxy verifies that a session exists, while several API handlers perform direct database operations. Review and enforce authorization and ownership checks in each handler before exposing the app to untrusted users.
- Set `secure` cookie behavior appropriately for local HTTP development and production HTTPS. The current login cookie is marked secure, which generally requires HTTPS.
- Supabase uploads use the server-only secret key. The bucket is public so returned object URLs can be used by the app; configure bucket policies and project access accordingly.
- Email sending is skipped if SMTP user or password is missing. Configure all SMTP values before relying on credential or notification emails.

## Current scope

This README describes behavior represented in the repository. The project does not currently include a test script, database migration/seed workflow beyond the development admin endpoint, or a documented production deployment pipeline.
