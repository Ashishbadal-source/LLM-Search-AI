from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import cohere
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///history.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class ChatHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.String(500), nullable=False)
    response = db.Column(db.Text, nullable=False)

with app.app_context():
    db.create_all()

@app.route('/api/query', methods=['POST'])
def get_response():
    data = request.get_json()
    query = data.get('query')

    if not query:
        return jsonify({'error': 'Query is required'}), 400

    cohere_api_key = os.getenv("COHERE_API_KEY")
    if not cohere_api_key:
        return jsonify({'error': 'Cohere API key not set'}), 500

    co = cohere.Client(cohere_api_key)
    result = co.generate(prompt=query, max_tokens=100)
    answer = result.generations[0].text.strip()

    new_entry = ChatHistory(question=query, response=answer)
    db.session.add(new_entry)
    db.session.commit()

    return jsonify({'response': answer})

@app.route('/api/history', methods=['GET'])
def get_history():
    history = ChatHistory.query.order_by(ChatHistory.id.desc()).all()
    return jsonify([
        {'question': h.question, 'answer': h.response} for h in history
    ])

@app.route('/')
def home():
    return " LLM Backend is Live!"

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
