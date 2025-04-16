import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import pathlib

# Import routers
from app.routers import chat_data, analysis, users, search

# Get the absolute path to the data file
root_dir = pathlib.Path(__file__).parent.parent.absolute()
data_file = os.path.join(root_dir, "result.json")

# Set the environment variable to use the real data file
os.environ["CHAT_FILE_PATH"] = str(data_file)

# Create FastAPI app
app = FastAPI(
    title="Telegram Group Chat Profiler",
    description="A web application to analyze Telegram group chat exports",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat_data.router, prefix="/api/chat", tags=["chat_data"])
app.include_router(analysis.router, prefix="/api/analytics", tags=["analysis"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(search.router, prefix="/api/search", tags=["search"])

# Serve static files if needed
# app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    return {"message": "Welcome to Telegram Group Chat Profiler API"}

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    # Get port from environment or use default
    port = int(os.environ.get("PORT", 8000))
    
    # Log the data file path for debugging
    print(f"Using data file at: {os.environ['CHAT_FILE_PATH']}")
    
    # Run the application with uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True) 