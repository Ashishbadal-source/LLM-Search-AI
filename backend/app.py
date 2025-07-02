from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import cohere

app = Flask(__name__)
CORS(app)

#  SQLite DB config
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///history.db'
db = SQLAlchemy(app)

#  DB model
class ChatHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.String(500))
    response = db.Column(db.Text)

#  Create DB tables
with app.app_context():
    db.create_all()

#  Your main LLM endpoint
@app.route('/api/query', methods=['POST'])
def get_response():
    data = request.get_json()
    query = data.get('query')

    # Use Cohere or mock response
    co = cohere.Client("WINfu6VSSdqiFtfjbbWsOWsmT6SXNNjGt77IEy6q")
    result = co.generate(prompt=query, max_tokens=100)
    answer = result.generations[0].text.strip()

    #  Save to database
    new_entry = ChatHistory(question=query, response=answer)
    db.session.add(new_entry)
    db.session.commit()

    return jsonify({'response': answer})

#  New route to fetch history
@app.route('/api/history', methods=['GET'])
def get_history():
    history = ChatHistory.query.order_by(ChatHistory.id.desc()).all()
    return jsonify([
        {'question': h.question, 'answer': h.response} for h in history
    ])

if __name__ == '__main__':
    app.run(debug=True)
