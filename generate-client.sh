#!/bin/bash
# generate-client.sh

# Set variables
VENV_PATH="backend/.env/bin/activate"
# VENV_PATH="venv/bin/activate"    # for Unix/Mac
API_PORT=4001
UI_DIR="../ui"  # adjust this path to your UI directory
TIMEOUT=10  # seconds to wait for server to start

# Function to check if serverless is running
check_server() {
    curl -s http://localhost:4321 > /dev/null
    return $?
}

# Function to cleanup and exit
cleanup() {
    echo "Stopping serverless offline..."
    kill $SERVER_PID
    exit
}

# Set up trap for cleanup on script exit
trap cleanup EXIT

echo "Activating virtual environment..."
source $VENV_PATH

echo "Starting serverless offline..."
cd backend
serverless offline --httpPort 4321 &
SERVER_PID=$!

echo "Waiting for server to start..."
COUNTER=0
until check_server || [ $COUNTER -eq $TIMEOUT ]; do
    echo "Waiting... ($COUNTER/$TIMEOUT)"
    sleep 1
    ((COUNTER++))
done

if [ $COUNTER -eq $TIMEOUT ]; then
    echo "Server failed to start within $TIMEOUT seconds"
    exit 1
fi

echo "Server is running. Generating client..."
cd $UI_DIR

openapi --input http://localhost:4321/openapi.json --output ./src/api/auto-generated-client --client axios --name MyApiClient

echo "Client generation complete!"