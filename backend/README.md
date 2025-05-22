## To deploy:
Run `serverless deploy`

# Running API Locally

## Option 1
1. Get on the pyenv `source .env/bin/activate`
2. go to the main.py directory `cd/backend/app`
3. Run the API with uvicorn `uvicorn main:app --reload`

## Option 2
Using the serverless offline plugin
1. Run `serverless offline --httpPort 4000`
The selected port must be pointed to from the UI

# Viewing Auto Generated API Docs
1. Run the API Locally
2. go to `http://localhost:8000/docs`
