from datetime import datetime
import re
from turtle import position
from typing import Container, Dict, List, Union
from unicodedata import category
from xml.etree.ElementTree import tostring
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from pydantic import BaseModel
from pynamodb.models import Model
from pynamodb.attributes import (
    UnicodeAttribute,
    BooleanAttribute,
    UTCDateTimeAttribute,
    NumberAttribute,
)


app = FastAPI()

TASK_TABLE_NAME = "sea-tasks-2"
frontEnd_URL = ""

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UserModel(Model):
    """
    A DynamoDB User
    """

    class Meta:
        table_name = "dynamodb-user"

    email = UnicodeAttribute(null=True)
    first_name = UnicodeAttribute(range_key=True)
    last_name = UnicodeAttribute(hash_key=True)


class TaskTableModel(Model):
    class Meta:
        table_name = TASK_TABLE_NAME

    pk = UnicodeAttribute(hash_key=True)
    sk = UnicodeAttribute(range_key=True)

    id = UnicodeAttribute()
    userId = UnicodeAttribute()

    name = UnicodeAttribute(default="")
    description = UnicodeAttribute(default="")
    completed = BooleanAttribute(default=False)
    createdAt = UTCDateTimeAttribute(default_for_new=datetime.now())
    assignedTo = UnicodeAttribute(default="")

    category = UnicodeAttribute()
    position = NumberAttribute()


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
    createdAt: datetime
    assignedTo: str | None
    position: int


class ContainerCollection(BaseModel):
    __root__: Dict[Union[str, int], List[TaskType]]


class CreateTaskRequest(BaseModel):
    taskId: str
    userId: str
    category: str


class CreateTaskResponse(BaseModel):
    success: bool


def createTask(userId: str, taskId: str, category: str):
    task = TaskTableModel(f"USER#{userId}", f"TASK#{taskId}")
    task.id = taskId
    task.userId = userId
    task.category = category
    task.position = 1000
    task.save()


async def getTasks(userId: str):
    tasks = TaskTableModel.query(hash_key=f"USER#{userId}")
    return tasks


@app.post("/api/tasks", response_model=CreateTaskResponse)
async def create_task(request: CreateTaskRequest):
    print("Received Create task request!")
    try:
        createTask(request.userId, request.taskId, request.category)
        return CreateTaskResponse(success=True)
    except:
        return CreateTaskResponse(success=False)


class GetTaskRequest(BaseModel):
    userId: str


@app.get("/api/tasks/{userId}", response_model=ContainerCollection)
async def get_tasks(userId: str):
    print("Received Get Task Request ..")
    print(userId)
    tasks = await getTasks(userId)
    return_tasks = {}
    for task in tasks:
        print(task)
        if task.category not in return_tasks:
            return_tasks[task.category] = []
        newTask = TaskType(
            id=task.id,
            name=task.name,
            description=task.description,
            completed=task.completed,
            createdAt=task.createdAt,
            assignedTo=task.assignedTo,
            position=int(task.position),
        )
        return_tasks[task.category].append(newTask)
    return return_tasks


class UpdateTaskRequest(BaseModel):
    userId: str  # Shouldn't need this in the end
    name: str | None
    description: str | None
    completed: bool | None
    assignedTo: str | None
    category: str | None
    position: int


async def updateTask(
    userId,
    taskId,
    position,
    name=None,
    description=None,
    completed=None,
    assignedTo=None,
    category=None,
):
    task = TaskTableModel.get(hash_key=f"USER#{userId}", range_key=f"TASK#{taskId}")
    actions = []
    if name:
        actions.append(TaskTableModel.name.set(name))
    if description:
        actions.append(TaskTableModel.description.set(description))
    if not (completed == None):
        actions.append(TaskTableModel.completed.set(completed))
    if assignedTo:
        actions.append(TaskTableModel.assignedTo.set(assignedTo))
    if category:
        actions.append(TaskTableModel.category.set(category))
    actions.append(TaskTableModel.position.set(position))
    task.update(actions)


@app.patch("/api/tasks/{taskId}")
async def update_task(taskId: str, request: UpdateTaskRequest):
    print("Received update task request ..")
    print(request)
    await updateTask(
        request.userId,
        taskId,
        request.position,
        request.name,
        request.description,
        request.completed,
        request.assignedTo,
        request.category,
    )

async def deleteTask(userId, taskId):
    task = TaskTableModel.get(hash_key=f"USER#{userId}", range_key=f"TASK#{taskId}")
    task.delete()


class DeleteTaskRequest(BaseModel):
    userId: str


@app.delete("/api/tasks/{taskId}")
async def delete_task(taskId: str, request: DeleteTaskRequest):
    print("Received delete task request ..")
    await deleteTask(request.userId, taskId)


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

# UserModel.create_table(read_capacity_units=1, write_capacity_units=1)
# TaskTableModel.create_table(billing_mode="PAY_PER_REQUEST")
