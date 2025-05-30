from typing import Dict, List, TypedDict, Union
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


class TaskType(BaseModel):
    id: str | int
    name: str
    description: str
    completed: bool
    assignedTo: str | None


class ContainerCollection(BaseModel):
    __root__: Dict[Union[str, int], List[TaskType]]


@app.get("/api/tasks", response_model=ContainerCollection)
async def get_tasks():
    return {
        "Uncategorised": [
            {
                "id": "123",
                "name": "Item 1 Testing changes",
                "description": "First item description",
                "completed": False,
            },
            {
                "id": "A2",
                "name": "Item 2",
                "description": "Second Item description",
                "completed": False,
            },
            {
                "id": "A3",
                "name": "Item 3",
                "description": "Third Item description",
                "completed": False,
            },
        ],
        "PrioritizedBacklog": [],
        "Backlog": [],
        "Doing": [],
        "Done": [],
    }


class LoginRequest(BaseModel):
    username: str
    password: str


# Define the response model
class LoginResponse(BaseModel):
    isValid: bool


@app.post("/api/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    print("Received Login Request ..")
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
