# Telegram Group Chat Profiler

A full-stack web application for analyzing and visualizing Telegram group chat data exported in JSON format. This tool helps you gain insights from your Telegram group conversations through detailed user profiles, analytics, and search functionality.

## Features

- **Dashboard**: Get an overview of chat activity, trends, and statistics
- **User Profiles**: Detailed analysis of each user's messaging patterns, topics, and behavior
- **Analytics**: Visualize chat activity, popular topics, and user engagement metrics
- **Search**: Advanced search functionality to find specific messages and content

## Project Structure

The project consists of two main components:

- **Backend**: FastAPI application (Python) that handles data processing, analysis, and API endpoints
- **Frontend**: React application (JavaScript) that provides the user interface

## Getting Started

### Prerequisites

- Python 3.8+ for the backend
- Node.js 14+ for the frontend
- Telegram chat export in JSON format

### How to Export a Telegram Chat

1. Open Telegram Desktop
2. Navigate to the group chat you want to analyze
3. Click on the three dots (⋮) in the top right corner
4. Select "Export chat history"
5. Choose JSON format and select the content you want to export
6. Save the export file (result.json) in the root directory of this project

### Setup

#### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create a virtual environment:

```bash
python -m venv venv
```

3. Activate the virtual environment:

   - Windows:
   ```bash
   venv\Scripts\activate
   ```

   - macOS/Linux:
   ```bash
   source venv/bin/activate
   ```

4. Install dependencies:

```bash
pip install -r requirements.txt
```

5. Start the FastAPI server:

```bash
python main.py
```

The backend API will be running at `http://localhost:8000`.

#### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The frontend application will be running at `http://localhost:3000`.

### Using the Application

1. Open your browser and navigate to `http://localhost:3000`
2. The application will connect to the backend API automatically
3. Explore the different sections:
   - **Dashboard**: View overall statistics and summaries
   - **User Profiles**: Browse and analyze individual user behavior
   - **Analytics**: Explore detailed charts and visualizations
   - **Search**: Find specific messages or content

## Analysis Tools

In addition to the web application, this project includes a Python script for direct analysis of the JSON export:

- `analyze_json.py`: A standalone script that analyzes the structure of your Telegram export
   ```bash
   python analyze_json.py [path_to_your_export.json]
   ```

## Development

### Backend

The backend is built with FastAPI and provides the following endpoints:

- `/api/chat/*`: Chat data endpoints
- `/api/users/*`: User profile endpoints
- `/api/analytics/*`: Analytics data endpoints
- `/api/search/*`: Search functionality endpoints

API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Frontend

The frontend is built with React and includes:

- Responsive design using Tailwind CSS
- Dynamic charts with Recharts
- Client-side routing with React Router
- Data fetching with Axios and SWR

## License

This project is open source and available under the MIT License.

## Acknowledgements

- Built with FastAPI, React, and Tailwind CSS
- Data processing leverages NLTK, scikit-learn, and pandas 