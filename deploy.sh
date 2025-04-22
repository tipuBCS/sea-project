#!/bin/bash
# Build React app
cd ui
npm run build

# Sync with S3
aws s3 sync build/ s3://sea-project

# Optional: Invalidate CloudFront cache if using CDN
# aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"