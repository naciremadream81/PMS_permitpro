# PermitPro - Permit Management System

A comprehensive permit management system built with a modern web stack.

## Project Structure

```
permitpro/
├── permitpro-backend/     # Backend API server
├── permitpro-frontend/    # Frontend React application
├── package.json           # Monorepo configuration
└── README.md             # This file
```

## Quick Start

### Prerequisites
- [Bun](https://bun.sh/) (recommended) or Node.js
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd permitpro
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   bun install
   
   # Install backend dependencies
   cd permitpro-backend
   bun install
   
   # Install frontend dependencies
   cd ../permitpro-frontend
   bun install
   ```

3. **Set up the database**
   ```bash
   cd ../permitpro-backend
   
   # Set your DATABASE_URL in .env
   echo "DATABASE_URL=postgresql://username:password@localhost:5432/permitpro" > .env
   
   # Run database migrations
   bun run db:migrate
   
   # Seed the database (optional)
   bun run db:seed
   ```

4. **Start the development servers**
   ```bash
   # From the root directory
   bun start
   ```

   This will start both:
   - Backend: http://localhost:8000
   - Frontend: http://localhost:3000

## Development

### Backend
- **Location**: `permitpro-backend/`
- **Framework**: Express.js with Prisma ORM
- **Database**: PostgreSQL
- **Key Features**: REST API, file uploads, JWT authentication

### Frontend
- **Location**: `permitpro-frontend/`
- **Framework**: React with Webpack
- **Styling**: Tailwind CSS
- **Key Features**: Permit management, contractor management, checklist system

## Available Scripts

### Root Directory
- `bun start` - Start both backend and frontend in development mode

### Backend (`permitpro-backend/`)
- `bun run dev` - Start backend server
- `bun run db:migrate` - Apply production migrations
- `bun run db:migrate:dev` - Create new migrations (development)
- `bun run db:seed` - Seed the database
- `bun run db:generate` - Generate Prisma client
- `bun run db:push` - Push schema changes directly (development)
- `bun run db:studio` - Open Prisma Studio

### Frontend (`permitpro-frontend/`)
- `bun start` - Start development server
- `bun run build` - Build for production

## Environment Variables

### Backend (`.env`)
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/permitpro
JWT_SECRET=your-secret-key
PORT=8000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend (`.env`)
```bash
REACT_APP_API_URL=http://localhost:8000
```

## Database Schema

The application uses Prisma with the following main entities:
- **Permits**: Main permit records
- **Contractors**: Contractor information
- **Subcontractors**: Subcontractor assignments
- **Documents**: File uploads and attachments

## API Endpoints

- `GET /api/permits` - List all permits
- `POST /api/permits` - Create new permit
- `GET /api/permits/:id` - Get specific permit
- `PUT /api/permits/:id` - Update permit
- `DELETE /api/permits/:id` - Delete permit
- `POST /api/upload` - Upload documents

## Deployment

For deployment instructions, see the documentation in the `extra/` folder:
- Railway deployment guide
- AWS deployment guide
- Quick start guides

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Your License Here]
