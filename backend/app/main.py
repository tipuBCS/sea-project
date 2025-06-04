from datetime import datetime
import enum
from turtle import position
from typing import Dict, List, Literal, Union
from unicodedata import category
import uuid
from xml.etree.ElementTree import tostring
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from pydantic import BaseModel
from pynamodb.indexes import GlobalSecondaryIndex, AllProjection
from pynamodb.models import Model
from pynamodb.attributes import (
    UnicodeAttribute,
    BooleanAttribute,
    UTCDateTimeAttribute,
    NumberAttribute,
)
from pynamodb.pagination import ResultIterator


app = FastAPI()

USER_TABLE_NAME = "sea-users"
TASK_TABLE_NAME = "sea-tasks-4"


class Roles(enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"


frontEnd_URL = ""

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UsernameIndex(GlobalSecondaryIndex):
    class Meta:
        projection = AllProjection()

    username = UnicodeAttribute(hash_key=True)


class UserModel(Model):
    """
    A DynamoDB User
    """

    class Meta:
        table_name = USER_TABLE_NAME

    pk = UnicodeAttribute(hash_key=True)
    userId = UnicodeAttribute(null=False)
    username = UnicodeAttribute(null=False)
    password = UnicodeAttribute(null=False)
    role = UnicodeAttribute(default=Roles.USER.value)

    user_index = UsernameIndex()


class TaskIdIndex(GlobalSecondaryIndex):
    class Meta:
        projection = AllProjection()

    taskId = UnicodeAttribute(hash_key=True)


class TaskTableModel(Model):
    class Meta:
        table_name = TASK_TABLE_NAME

    pk = UnicodeAttribute(hash_key=True)
    sk = UnicodeAttribute(range_key=True)

    userId = UnicodeAttribute()
    taskId = UnicodeAttribute()

    name = UnicodeAttribute(default="")
    description = UnicodeAttribute(default="")
    completed = BooleanAttribute(default=False)
    createdAt = UTCDateTimeAttribute(default_for_new=datetime.now())
    assignedTo = UnicodeAttribute(default="")

    category = UnicodeAttribute()
    position = NumberAttribute()

    taskId_index = TaskIdIndex()


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/api/items")
async def get_items():
    return {"items": ["item1", "item2"]}


async def isLoginValid(username, password):
    users: ResultIterator[UserModel] = UserModel.user_index.query(
        username.lower(), limit=1
    )
    for user in users:
        print(user)
        if user.password == password:
            return True
    return False


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
    task.taskId = taskId
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
            id=task.taskId,
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
    username: str
    password: str
    name: str | None
    description: str | None
    completed: bool | None
    assignedTo: str | None
    category: str | None
    position: int


async def doesUserHavePermission(username, taskId) -> bool:
    print(f"Checking if {username} has access to {taskId}")
    # Check if user is an admin
    users: ResultIterator[UserModel] = UserModel.user_index.query(
        hash_key=username, limit=1
    )
    user: UserModel | None = None
    for _user in users:
        user = _user
    if not user:
        raise HTTPException(status_code=500, detail=str("User not found in database"))
    if user.role == Roles.ADMIN.value:
        print(f"YES - User is an admin")
        return True

    # Check if user owns task
    tasks: ResultIterator[TaskTableModel] = TaskTableModel.taskId_index.query(
        taskId, limit=1
    )
    for task in tasks:
        if task.userId == user.userId:
            print("YES - User owns task")
            return True

    print("NO - User does not have access")
    return False


async def updateTask(
    taskId,
    position,
    name=None,
    description=None,
    completed=None,
    assignedTo=None,
    category=None,
):
    tasks: ResultIterator[TaskTableModel] = TaskTableModel.taskId_index.query(
        hash_key=taskId, limit=1
    )
    for task in tasks:
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
    if not await isLoginValid(request.username, request.password):
        raise HTTPException(status_code=500, detail="Login was invalid")
    if not await doesUserHavePermission(request.username, taskId):
        raise HTTPException(
            status_code=500, detail="You do not have permission to do this."
        )

    await updateTask(
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


class LoginSuccess(BaseModel):
    isValid: Literal[True]
    userId: str
    username: str
    role: str


class LoginFail(BaseModel):
    isValid: Literal[False]


# Define the response model
class LoginResponse(BaseModel):
    response: Union[LoginSuccess, LoginFail]


class RegisterRequest(BaseModel):
    username: str
    password: str


class RegisterResponse(BaseModel):
    success: bool


@app.post("/api/register", response_model=RegisterResponse)
async def register(request: RegisterRequest):
    print("Received Register Request ..")
    print(request)
    try:
        userId = str(uuid.uuid4())
        user = UserModel(f"USER#{userId}")
        user.userId = userId
        user.username = request.username.lower()
        user.password = request.password
        user.save()
        return RegisterResponse(success=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    print("Received Login Request ..")
    print(request)
    try:
        users: ResultIterator[UserModel] = UserModel.user_index.query(
            request.username.lower(), limit=1
        )
        print("Got users")
        for user in users:
            print(user)
            if user.password == request.password:
                return LoginResponse(
                    response=LoginSuccess(
                        isValid=True,
                        userId=user.userId,
                        username=user.username,
                        role=user.role,
                    )
                )
        return LoginResponse(response=LoginFail(isValid=False))
    except Exception as e:
        print("Error occurred")
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


class User(BaseModel):
    userId: str
    username: str


class GetUsersResponse(BaseModel):
    users: List[User]


@app.get("/api/users", response_model=GetUsersResponse)
async def getUsers():
    username_list = []
    users: ResultIterator[UserModel] = UserModel.scan(
        attributes_to_get=["username", "userId"]
    )
    print(users)
    for user in users:
        print(user)
        username_list.append({"userId": user.userId, "username": user.username})
        print(username_list)
    print("returning the users")
    return {"users": username_list}


class GetUserResponse(BaseModel):
    displayName: str


@app.get("/api/user/{userId}", response_model=GetUserResponse)
async def getUser(userId: str):
    try:
        user = UserModel.get(hash_key=f"USER#{userId}")
        return {"displayName": user.username}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Handler for AWS Lambda
handler = Mangum(app)

# TaskTableModel.create_table(billing_mode="PAY_PER_REQUEST")
UserModel.create_table(billing_mode="PAY_PER_REQUEST")
