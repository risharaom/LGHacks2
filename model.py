from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np

app = Flask(__name__)
CORS(app)

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()

        if not data or 'responses' not in data:
            return jsonify({"error": "Missing 'responses' in request"}), 400

        responses = data['responses']

        # Validate responses
        if not isinstance(responses, list) or not all(isinstance(x, (int, float)) for x in responses):
            return jsonify({"error": "Invalid response format"}), 400

        # Dummy scoring logic (replace with your ML model later)
        addiction_score = np.mean(responses)
        addiction_percent = float(addiction_score * 100)
        predicted_class = "Addicted" if addiction_score >= 0.6 else "Moderate" if addiction_score >= 0.3 else "Not Addicted"

        return jsonify({
            "addiction_score": round(addiction_score, 2),
            "addiction_percent": addiction_percent,
            "predicted_class": predicted_class
        })

    except Exception as e:
        print("Error processing request:", e)
        return jsonify({"error": "Internal server error"}), 500


if __name__ == '__main__':
    app.run(debug=True)
