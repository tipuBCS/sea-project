from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from app.routes import tasks, users

app = FastAPI()

# Include routers
app.include_router(tasks.router)
app.include_router(users.router)


frontEnd_URL = ""

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Handler for AWS Lambda
handler = Mangum(app)
