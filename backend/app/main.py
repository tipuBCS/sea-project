from fastapi import FastAPI
from mangum import Mangum

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/api/items")
async def get_items():
    return {"items": ["item1", "item2"]}

# Handler for AWS Lambda
handler = Mangum(app)
