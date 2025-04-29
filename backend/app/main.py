from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from pydantic import BaseModel

app = FastAPI()

frontEnd_URL = ''

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

class LoginRequest(BaseModel):
    username: str
    password: str

# Define the response model
class LoginResponse(BaseModel):
    isValid: bool

@app.post("/login")
async def login(request: LoginRequest):
    print('Recieved Login Request')
    print(request)
    try:
        # Here you would typically:
        # 1. Verify the credentials against your database
        # 2. Generate a JWT token
        # 3. Return the token and any other user data

        # This is a simple example
        if request.username == "test" and request.password == "password":
            return LoginResponse(
                isValid=True
            )
        else:
            raise HTTPException(
                status_code=401,
                detail="Invalid username or password"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# Handler for AWS Lambda
handler = Mangum(app)
print("Completed")