#!/bin/bash
# Run this ONCE on Hostinger after first deployment
# It creates all database tables and adds default rewards

echo "🚀 Setting up database tables..."
npx prisma db push --skip-generate

echo "✅ Database ready!"
echo ""
echo "Now create your family account by running:"
echo "curl -X POST https://hive.innoahmad.net/api/seed \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"your@email.com\",\"password\":\"your-password\",\"adminName\":\"اسمك\"}'"
