#!/bin/bash

# Build auto-generated-clients
./generate-client.sh

# If this is failing, then you need to kill the process running on the port already first.
# Maybe find a better way to do this.
# # On Mac/Linux
# lsof -i :3002
# kill -9 <PID>

# Build React app
cd ui
npm run build

# Sync with S3
aws s3 sync build/ s3://sea-project

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id E1A3KIDEFNLLCM --paths "/*"

# Deploy Backend
cd ../backend
pnpm run deploy