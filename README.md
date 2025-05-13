# sea-project
Software Engineering and Agile (SEA) Project


# Deployment Guide
## Deploying the UI
1. Create a build file with 'pnpm run build' inside ui
2. Upload build file to the S3 bucket hosting the website
3. Delete the cache 

# Using Guide:
1. Get website url:
   - Go to Cloudfront
   - Go to the Correct distribution (connected to the S3 bucket)
   - Read Distribution domain name e.g. (d39kticnloydq6.cloudfront.net)
   - Ender the domain name to login