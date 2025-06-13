from fastapi import FastAPI
from mangum import Mangum
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

app = FastAPI()

USER_TABLE_NAME = "sea-users"


class Roles(enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"


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


@app.get("/")
async def hello_world():
    request = LoginRequest(username="tesr", password="test")
    return await login(request)


@app.get("/hello/{name}")
def hello(name: str):
    return {"message": f"Hello from FastAPI, {name}!"}


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


handler = Mangum(app)
