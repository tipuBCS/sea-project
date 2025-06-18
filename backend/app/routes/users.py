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
import re

USER_TABLE_NAME = "sea-users-2"

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
    firstname = UnicodeAttribute(null=False)
    lastname = UnicodeAttribute(null=False)
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
        if user.password == password:
            return True
    return False


async def getUserByUsername(username) -> UserModel:
    users: ResultIterator[UserModel] = UserModel.user_index.query(
        hash_key=username, limit=1
    )
    user: Union[UserModel, None] = None
    for _user in users:
        user = _user
    if not user:
        raise HTTPException(status_code=500, detail=str("User not found in database"))
    return user


# ========== REGISTER DEFINITION ==========
# ========== REGISTER DEFINITION ==========
# ========== REGISTER DEFINITION ==========


class RegisterRequest(BaseModel):
    firstname: str
    lastname: str
    username: str
    password: str
    role: str


class RegisterResponse(BaseModel):
    success: bool


def name_proper_case(name: str) -> str:
    if not name:
        return name
    return " ".join(word.capitalize() for word in name.lower().split())


def is_username_valid(username: str) -> tuple[bool, list[str]]:
    """
    Validates a username according to specified rules.
    Returns a tuple of (is_valid: bool, error_messages: list[str])
    """
    error_list = []

    # Check if username is empty
    if not username:
        error_list.append("Username cannot be blank!")
        return False, error_list

    # Check Length
    if not (3 <= len(username) <= 30):
        error_list.append("Username must be between 3-30 characters!")

    # Check allowed characters
    allowed_chars_pattern = r"^[a-zA-Z0-9._-]+$"
    if not re.match(allowed_chars_pattern, username):
        error_list.append(
            "Username can only contain letters, numbers, dots, underscores, and hyphens"
        )

    # Check if username starts with a letter
    if not username[0].isalpha():
        error_list.append("Username must start with a letter")

    return len(error_list) == 0, error_list


def is_password_valid(password: str) -> tuple[bool, list[str]]:
    """
    Validates a password according to specified rules.
    Returns a tuple of (is_valid: bool, error_messages: list[str])
    """
    error_list = []

    # Check if password is empty
    if not password:
        error_list.append("Password cannot be blank!")
        return False, error_list

    # Check Length
    if not (8 <= len(password) <= 30):
        error_list.append("Password must be between 8-30 characters!")

    # Has one uppercase character
    if not any(char.isupper() for char in password):
        error_list.append("Password must have at least one uppercase character")

    # Has one lowercase character
    if not any(char.islower() for char in password):
        error_list.append("Password must have at least one lowercase character")

    # Contains number
    if not any(char.isdigit() for char in password):
        error_list.append("Password must contain at least one number")

    # Check allowed characters
    allowed_chars_pattern = r"^[a-zA-Z0-9._-]+$"
    if not re.match(allowed_chars_pattern, password):
        error_list.append(
            "Password can only contain letters, numbers, dots, underscores, and hyphens"
        )

    return len(error_list) == 0, error_list


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
        username_valid, username_errors = is_username_valid(request.username)
        password_valid, password_errors = is_password_valid(request.password)

        if not username_valid or not password_valid:
            all_errors = username_errors + password_errors
            raise Exception("\n".join(all_errors))

        userId = str(uuid.uuid4())
        user = UserModel(f"USER#{userId}")
        user.userId = userId
        user.firstname = request.firstname
        user.lastname = request.lastname
        user.username = request.username.lower()
        user.displayName = name_proper_case(f"{request.firstname} {request.lastname}")
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
        print(users)
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
    print("Received Get Users Request ..")
    username_list = []
    users: ResultIterator[UserModel] = UserModel.scan(
        attributes_to_get=["username", "userId", "displayName"]
    )
    for user in users:
        username_list.append(
            {
                "userId": user.userId,
                "username": user.username,
                "displayName": user.displayName,
            }
        )
    print(f"Returning {len(username_list)} users ..")
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

if not UserModel.exists():
    UserModel.create_table(billing_mode="PAY_PER_REQUEST")
