#!/bin/bash

# Build React app
cd ui
npm run build

# Sync with S3
aws s3 sync build/ s3://sea-project

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id E1A3KIDEFNLLCM --paths "/*"
