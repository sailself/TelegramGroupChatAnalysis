# Telegram Group Chat Profiler - Backend

This is the backend for the Telegram Group Chat Profiler application. It provides APIs to analyze and visualize Telegram group chat data from JSON exports.

## Features

- Parse and analyze Telegram chat export files (result.json)
- Generate user profiles with detailed analytics
- Analyze chat activity patterns
- Extract topics and keywords from messages
- Provide comprehensive search functionality
- Support for multilingual content (English, Simplified Chinese, Traditional Chinese)

## Setup and Installation

### Prerequisites

- Python 3.8 or later
- Telegram chat export in JSON format (`result.json`)

### Installation

1. Clone the repository and navigate to the backend directory:

```bash
cd backend
```

2. Create a virtual environment:

```bash
python -m venv venv
```

3. Activate the virtual environment:

- On Windows:
```bash
venv\Scripts\activate
```

- On macOS/Linux:
```bash
source venv/bin/activate
```

4. Install dependencies:

```bash
pip install -r requirements.txt
```

5. Place your Telegram chat export file (`result.json`) in the project root or configure its path in the environment variables.

### Running the Application

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

## API Documentation

Once the server is running, you can access the auto-generated API documentation at:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Environment Variables

You can customize the application using the following environment variables:

- `CHAT_FILE_PATH`: Path to the Telegram export file (default: "result.json")
- `PORT`: Server port (default: 8000)

## Development

The project structure follows standard FastAPI organization:

- `app/models/`: Pydantic data models
- `app/routers/`: API route definitions
- `app/services/`: Business logic and services
- `app/utils/`: Utility functions
- `main.py`: Application entry point

## License

This project is licensed under the MIT License. 