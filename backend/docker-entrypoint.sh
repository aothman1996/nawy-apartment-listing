#!/bin/sh
set -e

echo "🚀 Starting Nawy Backend..."

# Wait for PostgreSQL to be ready and push schema
echo "⏳ Waiting for PostgreSQL and initializing database..."
max_attempts=30
attempt=0

until npx prisma db push --skip-generate --accept-data-loss 2>&1; do
  attempt=$((attempt + 1))
  if [ $attempt -ge $max_attempts ]; then
    echo "❌ Database initialization failed after $max_attempts attempts"
    exit 1
  fi
  echo "⏳ Database not ready (attempt $attempt/$max_attempts) - retrying in 2s..."
  sleep 2
done

echo "✅ Database schema initialized!"

# Seed the database
echo "📊 Seeding database..."
npm run db:seed

echo "✅ Database ready!"
echo "🎉 Starting application..."

# Start the application
exec npm start
