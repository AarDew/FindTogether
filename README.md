# FindTogether Backend API

A Node.js + Express backend with MongoDB integration for the FindTogether application.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Complete CRUD operations for users
- **Sighting Reports**: Geospatial queries for location-based sighting reports
- **Case Management**: Investigation case tracking and management
- **File Upload**: Support for images and videos
- **Security**: Rate limiting, CORS, helmet, and input validation
- **Error Handling**: Comprehensive error handling middleware
- **Background Jobs**: Inngest integration for asynchronous task processing

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, helmet, and cors
- **Validation**: express-validator
- **File Upload**: multer
- **Background Jobs**: Inngest

## Project Structure

```text
backend/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── userController.js     # User management
│   ├── sightingController.js # Sighting reports
│   └── caseController.js     # Case management
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   ├── errorHandler.js      # Global error handling
│   └── inngest.js           # Inngest middleware
├── models/
│   ├── User.js              # User schema
│   ├── Sighting.js          # Sighting report schema
│   └── Case.js              # Case schema
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User routes
│   ├── sightings.js         # Sighting routes
│   └── cases.js             # Case routes
├── utils/
│   └── inngest.js           # Inngest utility functions
├── inngest/
│   └── index.js             # Inngest functions and client
├── server.js                # Main server file
├── package.json             # Dependencies and scripts
└── env.example              # Environment variables template
```

## Installation

1. **Clone the repository** and navigate to the backend directory:

	```sh
	git clone <repository-url>
	cd findtogether-app/backend
	```

2. **Install dependencies:**

	```sh
	npm install
	```

3. **Configure environment variables:**

	```sh
	cp env.example .env
	```

	Set the values in `.env` for your environment:

	```dotenv
	PORT=5000
	NODE_ENV=development
	MONGODB_URI=mongodb://localhost:27017/findtogether
	JWT_SECRET=your-super-secret-jwt-key
	JWT_EXPIRE=30d
	FRONTEND_URL=http://localhost:3000
	INNGEST_EVENT_KEY=your-inngest-event-key
	INNGEST_SIGNING_KEY=your-inngest-signing-key
	INNGEST_DEV_SERVER_URL=http://localhost:8288
	```

4. **Start MongoDB** locally or configure a MongoDB Atlas connection.

5. **Run the server:**

	```sh
	# Development mode
	npm run dev

	# Production mode
	npm start
	```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Log in a user | Public |
| `GET` | `/api/auth/me` | Get the current user | Protected |
| `PUT` | `/api/auth/updatedetails` | Update user details | Protected |
| `PUT` | `/api/auth/updatepassword` | Update password | Protected |
| `POST` | `/api/auth/logout` | Log out | Protected |

### Users

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/users` | Get all users | Admin/Moderator |
| `GET` | `/api/users/:id` | Get a user | Admin/Moderator |
| `POST` | `/api/users` | Create a user | Admin |
| `PUT` | `/api/users/:id` | Update a user | Admin |
| `DELETE` | `/api/users/:id` | Delete a user | Admin |
| `GET` | `/api/users/stats` | Get user statistics | Admin |

### Sightings

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/sightings` | Get all sightings | Public |
| `GET` | `/api/sightings/:id` | Get a sighting | Public |
| `POST` | `/api/sightings` | Create a sighting | Protected |
| `PUT` | `/api/sightings/:id` | Update a sighting | Protected |
| `DELETE` | `/api/sightings/:id` | Delete a sighting | Protected |

### Cases

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/cases` | Get all cases | Protected |
| `GET` | `/api/cases/:id` | Get a case | Protected |
| `POST` | `/api/cases` | Create a case | Protected |
| `PUT` | `/api/cases/:id` | Update a case | Protected |
| `DELETE` | `/api/cases/:id` | Delete a case | Admin |
| `POST` | `/api/cases/:id/notes` | Add a note to a case | Protected |
| `GET` | `/api/cases/stats` | Get case statistics | Admin/Moderator |

### Inngest

| Endpoint | Description |
|---|---|
| `/inngest` | Inngest development server and webhook endpoint |

## Background Jobs with Inngest

The backend uses Inngest for background jobs and scheduled tasks.

### Available Functions

1. **Email Notifications** (`send-email-notification`): Sends event-based notifications, including welcome emails, sighting confirmations, and case updates.
2. **Sighting Processing** (`process-new-sighting`): Checks new sightings for nearby similar reports, can automatically create cases when multiple sightings are detected, and sends alerts for high-priority sightings.
3. **Data Cleanup** (`cleanup-old-data`): Removes old resolved cases and sightings as part of scheduled maintenance.

### Usage Examples

```js
// Send a welcome email
const { sendWelcomeEmail } = require('./utils/inngest');
await sendWelcomeEmail(user);

// Process a new sighting
const { processSighting } = require('./utils/inngest');
await processSighting({ sightingId, userId });

// Schedule cleanup
const { scheduleCleanup } = require('./utils/inngest');
await scheduleCleanup({ dataType: 'resolved-cases', daysOld: 30 });
```

### Inngest Development

1. Start the Inngest development server:

	```sh
	npx inngest-cli@latest dev
	```

2. Open the dashboard at [http://localhost:8288](http://localhost:8288/) to monitor events and function executions.
3. Review function logs and execution details in the dashboard.

## Database Models

### User

- Basic information: name, email, and password
- Role-based access: user, moderator, and admin
- Profile management

### Sighting

- Location data with geospatial indexing
- Image and video attachments
- Voting and reporting system
- Status tracking

### Case

- Investigation case management
- Evidence tracking
- Witness and suspect information
- Notes and comments

## Security Features

- **JWT authentication** for token-based sessions
- **Password hashing** with bcryptjs
- **Rate limiting** to help prevent abuse
- **CORS** configuration for cross-origin requests
- **Helmet** security headers
- **Input validation** for incoming requests
- **Centralized error handling** for consistent error responses

## Development

### Scripts

- `npm run dev` — Start the development server with nodemon
- `npm start` — Start the production server
- `npm test` — Run tests

### Environment Variables

| Variable | Purpose |
|---|---|
| `PORT` | Server port (default: `5000`) |
| `NODE_ENV` | Runtime environment (`development` or `production`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRE` | JWT expiration duration |
| `FRONTEND_URL` | Frontend origin allowed by CORS |
| `INNGEST_EVENT_KEY` | Inngest event key |
| `INNGEST_SIGNING_KEY` | Inngest signing key |
| `INNGEST_DEV_SERVER_URL` | Inngest development server URL |

## Deployment

1. Configure production environment variables.
2. Run the application with PM2 or a similar process manager.
3. Set up MongoDB Atlas or a self-hosted MongoDB instance.
4. Configure a reverse proxy such as nginx.
5. Set up SSL certificates.
6. Configure Inngest for production.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Add tests where applicable.
5. Submit a pull request.

