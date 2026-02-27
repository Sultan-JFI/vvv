from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncEngine
import os
from .database import engine, get_session, Base
from .schemas import ItemCreate, ItemRead
from .crud import create_item, get_item, list_items
from .utils import setup_logging, log_request, serialize_response, APIException

setup_logging()

app = FastAPI(title="VVV Backend (FastAPI)")

# Development CORS - tighten for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    # create tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/health")
@log_request
async def health():
    return serialize_response({"status": "ok"}, message="healthy")

@app.post("/items", response_model=ItemRead)
@log_request
async def create_item_endpoint(item: ItemCreate):
    db_item = await create_item(item)
    return serialize_response(db_item, message="item created")

@app.get("/items")
@log_request
async def list_items_endpoint():
    items = await list_items()
    return serialize_response(items)

@app.get("/items/{item_id}")
@log_request
async def get_item_endpoint(item_id: int):
    item = await get_item(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="item not found")
    return serialize_response(item)