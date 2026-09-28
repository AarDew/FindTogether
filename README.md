# FindTogether

FindTogether is a missing-person support web application for publishing cases, reporting sightings, and reviewing uploaded footage and potential matches. The current repository contains a React frontend backed by Supabase; it does not contain a Node.js/Express or MongoDB server.

## Features

- **Missing-person cases**: Browse active cases and submit a case with contact information, last-seen details, a description, and an optional photo.
- **Sighting reports**: Submit a sighting report with location, date, description, and reporter contact details.
- **Authentication**: Register and sign in through Supabase Auth.
- **User dashboard**: View a user's submitted cases and footage uploads, with case and footage updates reflected through Supabase Realtime subscriptions.
- **Footage uploads**: Upload video files to Supabase Storage and create footage-upload records associated with a case.
- **Admin review pages**: Review match records and footage; review person re-identification results on a separate admin page.
- **AI/re-identification prototypes**: Includes a browser face-detection service, a mock footage-processing flow, and a Supabase Edge Function interface for results from an external person re-identification pipeline.
- **Legal help**: Includes a legal-help information page.

## Tech Stack

- **Frontend**: React 18, TypeScript, and Vite 5
- **UI**: Tailwind CSS, shadcn-style components built on Radix UI, and Lucide icons
- **Routing and data fetching**: React Router and TanStack Query
- **Backend services**: Supabase Auth, PostgreSQL, Row Level Security (RLS), Realtime, Storage, and Edge Functions
- **Browser AI prototype**: Transformers.js with WebGPU preference and CPU fallback
- **External processing interface**: A Supabase Edge Function accepts results from an external Python person re-identification pipeline; that Python service is not included in this repository

## Project Structure

```text
FindTogether/
├── public/
│   └── models/                  # Model download notes and placeholder folders
├── src/
│   ├── components/              # Shared app and UI components
│   ├── hooks/                   # React hooks, including admin-role checks
│   ├── integrations/supabase/   # Supabase client and generated database types
│   ├── pages/                   # App and admin pages
│   ├── services/                # Face-detection and person re-ID helpers
│   ├── types/                   # Shared TypeScript types
│   ├── App.tsx                  # Client-side routes
│   └── main.tsx                 # Frontend entry point
├── supabase/
│   ├── functions/
│   │   ├── processFootage/      # Footage-processing Edge Function and pipeline
│   │   └── receiveReIdResults/  # External re-ID result ingestion function
│   ├── migrations/              # PostgreSQL tables, policies, and storage setup
│   └── config.toml              # Supabase project and function settings
├── package.json
├── package-lock.json
└── vite.config.ts
```

## Installation

1. **Clone the repository** and enter the project directory:

   ```sh
   git clone https://github.com/AarDew/FindTogether.git
   cd FindTogether
   ```

2. **Install frontend dependencies:**

   ```sh
   npm install
   ```

3. **Configure Supabase.** The frontend Supabase URL and publishable (anon) key are currently set in `src/integrations/supabase/client.ts`. To use a different Supabase project, update those client settings, then link the Supabase CLI to your project and apply the SQL migrations:

   ```sh
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```

   The migrations create the app tables, RLS policies, storage buckets, and Realtime configuration. Do not put a Supabase service-role key in frontend code.

4. **Configure Edge Function secrets** in Supabase for the functions that need database access. In particular, `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are read by the Edge Functions; keep the service-role key server-side only.

5. **Start the frontend development server:**

   ```sh
   npm run dev
   ```

   Vite serves the app at [http://localhost:8080](http://localhost:8080) by default.

## API Endpoints

The application has client-side routes rather than an Express REST API. Data operations are made through the Supabase client and its policies.

### Authentication

| Route | Description |
|---|---|
| `/login` | Sign in with Supabase Auth |
| `/register` | Create an account with Supabase Auth |
| `/dashboard` | View the signed-in user's cases and footage uploads |

### Users

There is no standalone user CRUD API. Supabase Auth manages accounts, and the `user_roles` table plus the `has_role` database function represent `user`, `moderator`, and `admin` roles.

### Sightings

| Route | Description |
|---|---|
| `/report-sighting` | Submit a sighting to the Supabase `sightings` table |

The current code does not implement geospatial sighting searches.

### Cases

| Route | Description |
|---|---|
| `/` | Browse active missing-person cases |
| `/submit-case` | Submit a missing-person case |
| `/upload-footage` | Upload video footage for a case |
| `/admin/matches` | Review match records |
| `/admin/footage` | Review and manage footage uploads |
| `/admin/ai-analysis` | Review external person re-identification results |
| `/legal-help` | View legal-help information |

### Supabase Edge Functions

| Function | Endpoint suffix | Purpose |
|---|---|---|
| `processFootage` | `/functions/v1/processFootage` | Accepts a `video_url` and `case_id` and attempts to create match records |
| `receiveReIdResults` | `/functions/v1/receiveReIdResults` | Accepts results from an external person re-identification process and stores the result and top matches |

## Background Jobs with Supabase Edge Functions

The repository uses Supabase Edge Functions for server-side processing. It does not use Inngest.

### Available Functions

1. **Footage processing** (`processFootage`): The current Edge Function contains placeholder frame extraction and mock model inference; it should not be treated as production face recognition.
2. **Re-identification result intake** (`receiveReIdResults`): Stores submitted analysis summaries and up to ten ranked matches. The external Python/GPU processing service that sends these results is not included here.
3. **Admin footage action**: The current admin footage page generates simulated match rows; it does not invoke a production AI processing pipeline.

### Usage Examples

1. A signed-in user uploads a video to the Supabase `footage` Storage bucket and creates a `footage_uploads` record.
2. An admin reviews footage in the admin UI. The current UI's processing action is a simulation.
3. For external re-identification, a separate Python service can submit its results to `receiveReIdResults`; the function stores them in `reid_results` and `reid_matches`.

### Supabase Development

Install the [Supabase CLI](https://supabase.com/docs/guides/cli), then use it to start a local Supabase stack, apply migrations, and serve or deploy the Edge Functions. The Supabase dashboard can be used to inspect database, storage, authentication, and function logs. Edge Function deployment is separate from building the Vite frontend.

## Database Models

### User

- Accounts are managed by Supabase Auth rather than a custom user table.
- `user_roles` stores application roles (`user`, `moderator`, or `admin`).
- The `has_role` database function is used by the frontend to check for the admin role.

### Sighting

- `sightings` stores the missing-person name, sighting location and date, description, reporter contact details, optional photo URL, and status.
- Sighting photos use the Supabase Storage `sightings` bucket.

### Case

- `cases` stores missing-person details, last-seen information, contact details, optional description/features and photo URL, status, and the submitting user's ID.
- Case photos and footage are uploaded to Supabase Storage.
- `footage_uploads` tracks video URLs, case/user IDs, processing status, and timestamps.
- `matches` stores potential match confidence, timestamp, review status, and comments.
- `face_embeddings` stores case-associated embeddings.
- `reid_results` and `reid_matches` store summaries and ranked matches returned by the external re-identification pipeline.

## Security Features

- **Supabase Auth** provides account registration, login, and persisted browser sessions.
- **Row Level Security** is enabled on the application tables, with access policies defined in the migrations.
- **Role checks** use the `has_role` database function and `user_roles` table.
- **Publishable key**: The key in the frontend client is intended to be public; access must be enforced by RLS. Never expose a service-role key in browser code.
- **Production review required**: The current config disables JWT verification for both Edge Functions, some Storage policies allow public uploads/reads, and the login UI contains a client-side admin-key check. Review and secure these paths before production use; client-side checks are not authorization boundaries.

## Development

### Scripts

- `npm run dev` — Start the Vite development server
- `npm run build` — Build the production frontend into `dist/`
- `npm run build:dev` — Build using Vite's development mode
- `npm run lint` — Run ESLint
- `npm run preview` — Preview the built frontend locally

### Environment Variables

The Vite frontend currently reads its Supabase URL and publishable key from `src/integrations/supabase/client.ts`; it does not currently read frontend `.env` variables.

| Variable | Used by | Purpose |
|---|---|---|
| `SUPABASE_URL` | Supabase Edge Functions | Supabase project URL; provided/configured in the Edge Function runtime |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Edge Functions | Server-side database access; store as a secret and never expose in the frontend |

## Deployment

1. Run `npm run build` and deploy the generated `dist/` directory to a static web host.
2. Configure the host to serve the SPA entry point for client-side routes.
3. Configure the Supabase project, authentication redirect URLs, database migrations, Storage buckets, and RLS policies.
4. Set required Edge Function secrets and deploy `processFootage` and `receiveReIdResults` separately.
5. Provide and secure an external processing service if real person re-identification is required. The included processing paths contain mock/simulated behavior.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Add tests where applicable.
5. Submit a pull request.

