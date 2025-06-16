import enum
from typing import Dict, List, Union
from pydantic import BaseModel
from pynamodb.indexes import GlobalSecondaryIndex, AllProjection
from pynamodb.models import Model
from pynamodb.attributes import (
    UnicodeAttribute,
    BooleanAttribute,
    UTCDateTimeAttribute,
    NumberAttribute,
)
from datetime import datetime
from pynamodb.pagination import ResultIterator
from fastapi import APIRouter, HTTPException

from app.util.pynamoEnum import EnumAttribute
from ..routes import users

TASK_TABLE_NAME = "sea-tasks-5"


router = APIRouter(prefix="/tasks", tags=["tasks"])

# ========== TASK TABLE DEFINITION  ==========
# ========== TASK TABLE DEFINITION  ==========
# ========== TASK TABLE DEFINITION  ==========


class TaskImportance(str, enum.Enum):
    NONE = "NONE"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class TaskIdIndex(GlobalSecondaryIndex):
    class Meta:
        projection = AllProjection()

    taskId = UnicodeAttribute(hash_key=True)


class TaskTableModel(Model):
    class Meta:
        table_name = TASK_TABLE_NAME

    # Keys
    pk = UnicodeAttribute(hash_key=True)
    sk = UnicodeAttribute(range_key=True)

    # Identifiers
    userId = UnicodeAttribute()
    taskId = UnicodeAttribute()

    # Task Attributes
    name = UnicodeAttribute(default="")
    description = UnicodeAttribute(default="")
    completed = BooleanAttribute(default=False)
    assignedTo = UnicodeAttribute(default="")
    dueDate = UnicodeAttribute(default="")
    minTime = NumberAttribute(default=-1)
    maxTime = NumberAttribute(default=-1)
    importance = EnumAttribute(enum_class=TaskImportance, default=TaskImportance.NONE)
    createdAt = UTCDateTimeAttribute(default_for_new=datetime.now())

    # Positions
    category = UnicodeAttribute()
    position = NumberAttribute()

    # Secondary Index
    taskId_index = TaskIdIndex()


class TaskType(BaseModel):
    id: Union[str, int]
    name: str
    description: str
    completed: bool
    createdAt: datetime
    assignedTo: Union[str, None]
    position: int
    dueDate: Union[str, None]
    minTime: int
    maxTime: int
    importance: TaskImportance


class ContainerCollection(BaseModel):
    __root__: Dict[Union[str, int], List[TaskType]]


# ========== VALIDATE PERMISSION ==========
# ========== VALIDATE PERMISSION ==========
# ========== VALIDATE PERMISSION ==========


async def doesUserHavePermissionToTask(username, password, taskId) -> bool:
    print(f"Checking if {username} has access to {taskId}")

    # Check that username and password is correct
    if not await users.isLoginValid(username, password):
        raise HTTPException(status_code=500, detail="Login was invalid")

    user = await users.getUserByUsername(username)
    # Check if user is an admin

    if user.role.lower() == users.Roles.ADMIN.value.lower():
        print(f"YES - User is an admin")
        return True

    # Check if user owns task
    tasks: ResultIterator[TaskTableModel] = TaskTableModel.taskId_index.query(
        hash_key=taskId, limit=1
    )
    for task in tasks:
        print(task)
        if task.userId == user.userId:
            print("YES - User owns task")
            return True

    print("NO - User does not have access")
    return False


async def canUserCreateTaskInBoard(username, password, boardUserId) -> bool:
    if not await users.isLoginValid(username, password):
        return False

    # Check if they are admin
    user = await users.getUserByUsername(username)
    if user.role.lower() == users.Roles.ADMIN.value.lower():
        return True

    # Check if they own the board
    if user.userId == boardUserId:
        return True
    return False


# ========== CREATE TASK ==========
# ========== CREATE TASK ==========
# ========== CREATE TASK ==========


class CreateTaskRequest(BaseModel):
    username: str
    password: str
    taskId: str
    boardUserId: str
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


@router.post("/api/tasks", response_model=CreateTaskResponse)
async def create_task(request: CreateTaskRequest):
    print("Received Create task request ..")
    try:
        if not await canUserCreateTaskInBoard(
            request.username, request.password, request.boardUserId
        ):
            print("Insufficient Permission to create Task ..")
            return CreateTaskResponse(success=False)
        print("Creating Task ..")
        createTask(request.boardUserId, request.taskId, request.category)
        return CreateTaskResponse(success=True)
    except:
        print("Insufficient Permission to create Task ..")
        return CreateTaskResponse(success=False)


# ========== GET TASKS ==========
# ========== GET TASKS ==========
# ========== GET TASKS ==========


async def getTasks(userId: str):
    tasks = TaskTableModel.query(hash_key=f"USER#{userId}")
    return tasks


@router.get("/api/tasks/{userId}", response_model=ContainerCollection)
async def get_tasks(userId: str):
    print("Received Get Task Request ..")
    print(userId)
    tasks = await getTasks(userId)
    count = 0
    return_tasks = {}
    for task in tasks:
        count += 1
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
            dueDate=task.dueDate,
            minTime=int(task.minTime),
            maxTime=int(task.maxTime),
            importance=task.importance,
        )
        return_tasks[task.category].append(newTask)
    print(f"Returning {count} Tasks ..")
    return return_tasks


# ========== UPDATE TASK ==========
# ========== UPDATE TASK ==========
# ========== UPDATE TASK ==========


class UpdateTaskRequest(BaseModel):
    username: str
    password: str
    name: Union[str, None]
    description: Union[str, None]
    completed: Union[bool, None]
    assignedTo: Union[str, None]
    category: Union[str, None]
    dueDate: Union[str, None]
    minTime: Union[int, None]
    maxTime: Union[int, None]
    importance: Union[TaskImportance, None]

    position: int


async def updateTask(
    taskId,
    position,
    name=None,
    description=None,
    completed=None,
    assignedTo=None,
    category=None,
    minTime=None,
    maxTime=None,
    dueDate=None,
    importance=None
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
        if minTime:
            actions.append(TaskTableModel.minTime.set(minTime))
        if maxTime:
            actions.append(TaskTableModel.maxTime.set(maxTime))
        if dueDate:
            actions.append(TaskTableModel.dueDate.set(dueDate))
        if importance:
            actions.append(TaskTableModel.importance.set(importance))
        actions.append(TaskTableModel.position.set(position))
        task.update(actions)


@router.patch("/api/tasks/{taskId}")
async def update_task(taskId: str, request: UpdateTaskRequest):
    print("Received update task request ..")
    print(request)
    if not await doesUserHavePermissionToTask(
        request.username, request.password, taskId
    ):
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
        request.minTime,
        request.maxTime,
        request.dueDate,
        request.importance
    )


# ========== DELETE TASK ==========
# ========== DELETE TASK ==========
# ========== DELETE TASK ==========


class DeleteTaskRequest(BaseModel):
    username: str
    password: str


async def deleteTask(taskId):
    tasks = TaskTableModel.taskId_index.query(hash_key=taskId, limit=1)
    for task in tasks:
        task.delete()


@router.delete("/api/tasks/{taskId}")
async def delete_task(taskId: str, request: DeleteTaskRequest):
    print("Received delete task request ..")
    if not await doesUserHavePermissionToTask(
        request.username, request.password, taskId
    ):
        raise HTTPException(
            status_code=500, detail="You do not have permission to do this."
        )
    await deleteTask(taskId)


# ========== CREATE TABLE ==========
# ========== CREATE TABLE ==========
# ========== CREATE TABLE ==========

print("Checking if Table Exists ..")
if not TaskTableModel.exists():
    print("Creating table ..")
    TaskTableModel.create_table(billing_mode="PAY_PER_REQUEST")
else:
    print("Table already exists")
