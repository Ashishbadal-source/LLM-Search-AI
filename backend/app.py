from flask import Flask, request, jsonify
from flask_cors import CORS
import cohere

app = Flask(__name__)
CORS(app)

# ✅ Replace with your actual Cohere API key
co = cohere.Client("Xpe5y1XFUs2SoRk2HlPp51zFlq95Qvmfq5N7OFAM")

@app.route('/api/query', methods=['POST'])
def handle_query():
    data = request.get_json()
    query = data.get("query", "")

    try:
        response = co.chat(
            message=query,
            model="command-r",  # or "command-r+" (also free)
        )
        reply = response.text.strip()
        return jsonify({"response": reply})
    except Exception as e:
        return jsonify({"response": f"Error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
