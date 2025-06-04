import enum
from typing import Dict, List, Literal, Union
import uuid
from pydantic import BaseModel
from pynamodb.indexes import GlobalSecondaryIndex, AllProjection
from pynamodb.models import Model
from pynamodb.attributes import (
    UnicodeAttribute,
)
from pynamodb.pagination import ResultIterator
from fastapi import APIRouter, HTTPException

USER_TABLE_NAME = "sea-users"

router = APIRouter(prefix="/users", tags=["users"])


class Roles(enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"


# ========== USER TABLE DEFINITION  ==========
# ========== USER TABLE DEFINITION  ==========
# ========== USER TABLE DEFINITION  ==========


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
    displayName = UnicodeAttribute(null=False)
    password = UnicodeAttribute(null=False)
    role = UnicodeAttribute(default=Roles.USER.value)

    user_index = UsernameIndex()


# ========== HELPER FUNCTIONS  ==========
# ========== HELPER FUNCTIONS  ==========
# ========== HELPER FUNCTIONS  ==========


async def isLoginValid(username, password):
    users: ResultIterator[UserModel] = UserModel.user_index.query(
        username.lower(), limit=1
    )
    for user in users:
        print(user)
        if user.password == password:
            return True
    return False


async def getUserByUsername(username) -> UserModel:
    users: ResultIterator[UserModel] = UserModel.user_index.query(
        hash_key=username, limit=1
    )
    user: UserModel | None = None
    for _user in users:
        user = _user
    if not user:
        raise HTTPException(status_code=500, detail=str("User not found in database"))
    return user


# ========== REGISTER DEFINITION ==========
# ========== REGISTER DEFINITION ==========
# ========== REGISTER DEFINITION ==========


class RegisterRequest(BaseModel):
    username: str
    password: str
    role: str


class RegisterResponse(BaseModel):
    success: bool


def isUsernameValid(username: str) -> bool:
    return True


def isPasswordValid(password: str) -> bool:
    return True


def isRoleValid(role: str) -> bool:
    if role.upper() == Roles.ADMIN.value.upper():
        return True
    if role.upper() == Roles.USER.value.upper():
        return True
    return False


@router.post("/api/register", response_model=RegisterResponse)
async def register(request: RegisterRequest):
    print("Received Register Request ..")
    print(request)
    try:
        if not isUsernameValid(request.username):
            raise Exception("Username was invalid")
        if not isPasswordValid(request.password):
            raise Exception("Password was invalid")
        if not isRoleValid(request.role):
            raise Exception("Role was invalid")

        userId = str(uuid.uuid4())
        user = UserModel(f"USER#{userId}")
        user.userId = userId
        user.username = request.username.lower()
        user.displayName = request.username
        user.password = request.password
        user.role = request.role
        user.save()
        return RegisterResponse(success=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ========== LOGIN DEFINITION ==========
# ========== LOGIN DEFINITION ==========
# ========== LOGIN DEFINITION ==========


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


class LoginResponse(BaseModel):
    response: Union[LoginSuccess, LoginFail]


@router.post("/api/login", response_model=LoginResponse)
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


# ========== GET USERS ==========
# ========== GET USERS ==========
# ========== GET USERS ==========


class User(BaseModel):
    userId: str
    username: str
    displayName: str


class GetUsersResponse(BaseModel):
    users: List[User]


@router.get("/api/users", response_model=GetUsersResponse)
async def getUsers():
    username_list = []
    users: ResultIterator[UserModel] = UserModel.scan(
        attributes_to_get=["username", "userId", "displayName"]
    )
    print(users)
    for user in users:
        print(user)
        username_list.append(
            {
                "userId": user.userId,
                "username": user.username,
                "displayName": user.displayName,
            }
        )
        print(username_list)
    print("returning the users")
    return {"users": username_list}


# ========== GET USER ==========
# ========== GET USER ==========
# ========== GET USER ==========


class GetUserResponse(BaseModel):
    displayName: str


@router.get("/api/user/{userId}", response_model=GetUserResponse)
async def getUser(userId: str):
    try:
        user = UserModel.get(hash_key=f"USER#{userId}")
        return {"displayName": user.displayName}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ========== CREATE TABLE ==========
# ========== CREATE TABLE ==========
# ========== CREATE TABLE ==========

if not UserModel.exists:
    UserModel.create_table(billing_mode="PAY_PER_REQUEST")
