my-nextjs-app/
├── .github/                          # GitHub specific files
│   ├── workflows/                    # CI/CD workflows
│   │   ├── ci.yml
│   │   └── deploy.yml
│   └── PULL_REQUEST_TEMPLATE.md
├── .husky/                           # Git hooks
│   ├── pre-commit
│   └── pre-push
├── public/                           # Static assets
│   ├── images/
│   ├── fonts/
│   ├── icons/
│   └── favicon.ico
├── src/
│   ├── app/                          # Next.js 13+ App Router
│   │   ├── (auth)/                   # Route group for auth pages
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/              # Route group for dashboard
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   └── loading.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (marketing)/              # Route group for marketing pages
│   │   │   ├── about/
│   │   │   ├── pricing/
│   │   │   └── layout.tsx
│   │   ├── api/                      # API routes
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── users/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   └── webhooks/
│   │   │       └── stripe/
│   │   │           └── route.ts
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page
│   │   ├── loading.tsx               # Root loading UI
│   │   ├── error.tsx                 # Root error UI
│   │   ├── not-found.tsx             # 404 page
│   │   └── global-error.tsx          # Global error boundary
│   ├── components/                   # React components
│   │   ├── ui/                       # Base UI components (shadcn/ui style)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   └── ...
│   │   ├── forms/                    # Form components
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   └── profile-form.tsx
│   │   ├── layouts/                  # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── navigation.tsx
│   │   ├── providers/                # Context providers
│   │   │   ├── theme-provider.tsx
│   │   │   ├── auth-provider.tsx
│   │   │   └── query-provider.tsx
│   │   └── shared/                   # Shared/common components
│   │       ├── loading-spinner.tsx
│   │       ├── error-boundary.tsx
│   │       └── seo.tsx
│   ├── lib/                          # Utility functions and configurations
│   │   ├── api/                      # API client utilities
│   │   │   ├── client.ts
│   │   │   └── endpoints.ts
│   │   ├── db/                       # Database utilities
│   │   │   ├── prisma.ts
│   │   │   ├── queries/
│   │   │   └── migrations/
│   │   ├── auth/                     # Authentication utilities
│   │   │   ├── config.ts
│   │   │   └── utils.ts
│   │   ├── validations/              # Zod schemas and validation
│   │   │   ├── user.schema.ts
│   │   │   └── post.schema.ts
│   │   ├── utils.ts                  # General utilities
│   │   ├── constants.ts              # App constants
│   │   └── cn.ts                     # Class name utility
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-auth.ts
│   │   ├── use-media-query.ts
│   │   ├── use-local-storage.ts
│   │   └── use-debounce.ts
│   ├── services/                     # Business logic and external services
│   │   ├── user.service.ts
│   │   ├── post.service.ts
│   │   ├── email.service.ts
│   │   └── payment.service.ts
│   ├── store/                        # State management (Zustand/Redux)
│   │   ├── slices/
│   │   │   ├── auth.slice.ts
│   │   │   └── ui.slice.ts
│   │   └── index.ts
│   ├── types/                        # TypeScript type definitions
│   │   ├── api.types.ts
│   │   ├── user.types.ts
│   │   ├── post.types.ts
│   │   └── index.ts
│   ├── styles/                       # Global styles
│   │   ├── globals.css
│   │   └── themes/
│   │       ├── light.css
│   │       └── dark.css
│   ├── config/                       # Configuration files
│   │   ├── site.config.ts
│   │   ├── env.config.ts
│   │   └── seo.config.ts
│   ├── actions/                      # Server actions (Next.js 13+)
│   │   ├── auth.actions.ts
│   │   ├── user.actions.ts
│   │   └── post.actions.ts
│   └── middleware.ts                 # Next.js middleware
├── prisma/                           # Prisma ORM
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── tests/                            # Test files
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── setup.ts
├── scripts/                          # Utility scripts
│   ├── seed-db.ts
│   └── generate-sitemap.ts
├── docs/                             # Documentation
│   ├── API.md
│   └── ARCHITECTURE.md
├── .env.local                        # Environment variables
├── .env.example                      # Example environment variables
├── .eslintrc.json                    # ESLint configuration
├── .prettierrc                       # Prettier configuration
├── tsconfig.json                     # TypeScript configuration
├── next.config.js                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── postcss.config.js                 # PostCSS configuration
├── package.json                      # Dependencies and scripts
├── pnpm-lock.yaml                    # Lock file (or yarn.lock/package-lock.json)
└── README.md                         # Project documentation