# Railway Deployment for PermitPro Backend

## Quick Deploy Commands

### 1. Run Database Migrations
```bash
railway run bun run db:migrate
```

### 2. Generate Prisma Client (if needed)
```bash
railway run bun run db:generate
```

### 3. Seed Database (optional)
```bash
railway run bun run db:seed
```

## Available Scripts

- `bun run db:migrate` - Apply production migrations
- `bun run db:migrate:dev` - Create new migrations (development only)
- `bun run db:generate` - Generate Prisma client
- `bun run db:seed` - Seed database with sample data
- `bun run db:push` - Push schema changes directly (development)
- `bun run db:studio` - Open Prisma Studio

## Important Notes

- **Production**: Use `db:migrate` (runs `prisma migrate deploy`)
- **Development**: Use `db:migrate:dev` (runs `prisma migrate dev`)
- **Auto-generation**: Prisma client is automatically generated on `bun install`
- **Migrations**: All existing migrations will be applied in order

## Troubleshooting

If you get "Script not found" errors:
1. Make sure you're in the `permitpro-backend` directory
2. Verify the package.json has the correct scripts
3. Try running `bun install` first to ensure dependencies are installed
