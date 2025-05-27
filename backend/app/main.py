from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from pydantic import BaseModel

app = FastAPI()

frontEnd_URL = ""

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/api/items")
async def get_items():
    return {"items": ["item1", "item2"]}


class Task(BaseModel):
    id: str
    name: str
    description: str
    assignedTo: str | None
    category: str


@app.get("/api/tasks", response_model=List[Task])
async def get_tasks():
    return [
        {
            "id": "taskid1",
            "name": "First Task",
            "description": "lorem ipsum",
            "assignedTo": None,
            "category": "Milestones",
        },
        {
            "id": "taskid2",
            "name": "Second Task",
            "description": "lorem ipsum",
            "assignedTo": None,
            "category": "ProtoSec",
        },
        
        {
            "id": "taskid3",
            "name": "third Task",
            "description": "lorem ipsum",
            "assignedTo": None,
            "category": "ProtoSec",
        },
    ]


class LoginRequest(BaseModel):
    username: str
    password: str


# Define the response model
class LoginResponse(BaseModel):
    isValid: bool


@app.post("/api/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    print("Recieved Login Request")
    print(request)
    try:
        if request.username == "test" and request.password == "password":
            return LoginResponse(isValid=True)
        return LoginResponse(isValid=False)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Handler for AWS Lambda
handler = Mangum(app)
print("Started up Backend Server!")
print(app)
print(handler)