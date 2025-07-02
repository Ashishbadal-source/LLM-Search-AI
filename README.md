 🔍 Smart LLM Search App

A full-stack AI-powered smart search web application built with **React**, **Flask**, and **Cohere LLM API**. Users can type natural language questions and get intelligent responses using free LLM capabilities.


 -----> Features

 1. Ask anything via a clean React UI
 2. Uses **Cohere’s free LLM API** (no billing required)
 3. Backend built with Python Flask
 4. Beautiful frontend using TailwindCSS
 5. Fully local and modular (easy to deploy)


 ------> Tech Stack

| Layer       | Tech Used             |
|-------------|------------------------|
| Frontend    | React, TailwindCSS     |
| Backend     | Flask (Python)         |
| LLM API     | Cohere API (Free Tier) |
| Styling     | TailwindCSS            |



----->  Architecture Overview

[ React (frontend) ]   --->   POST /api/query
[ Flask API (backend) ]  --->   Cohere Chat API → response 



----->  Setup Instructions


📦 Frontend

```bash
cd frontend
npm install
npm start
This starts the React app on http://localhost:3000.




✈  Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install flask flask-cors cohere
python app.py
This starts the Flask backend on http://localhost:5000.



🔑 Setup Cohere API
Sign up at https://dashboard.cohere.com

Get your free API key
Paste it into app.py:

python
co = cohere.Client("YOUR_API_KEY")



Built this using:

Cohere API
Flask
React
TailwindCSS
