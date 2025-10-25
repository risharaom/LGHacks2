from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# =========================
# LOAD & CLEAN DATASET
# =========================
df = pd.read_csv("student_addiction_dataset_train.csv")

feature_cols = df.columns[:-1]
target_col = 'Addiction_Class'

# Convert Yes/No to 1/0
for col in feature_cols:
    if df[col].dtype == 'object':
        df[col] = df[col].astype(str).str.strip().str.lower().map({'yes': 1, 'no': 0})
    df[col] = df[col].fillna(0)

# Target column mapping
df[target_col] = df[target_col].map({'Yes': 1, 'No': 0}).fillna(0).astype(int)

# Separate addicted vs not addicted
addicted = df[df[target_col] == 1][feature_cols]
not_addicted = df[df[target_col] == 0][feature_cols]

# =========================
# SIMILARITY FUNCTION
# =========================
def similarity_score(user, group):
    return group.apply(lambda row: (row.fillna(0) == user.fillna(0)).mean(), axis=1).mean()

# =========================
# ANALYZE ROUTE
# =========================
@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.json
        responses = data.get("responses", [])

        if not responses or len(responses) != len(feature_cols):
            return jsonify({"error": "Invalid responses"}), 400

        # Align user input
        user_input = pd.Series(responses, index=feature_cols)

        sim_addicted = similarity_score(user_input, addicted)
        sim_not_addicted = similarity_score(user_input, not_addicted)

        if np.isnan(sim_addicted) or np.isnan(sim_not_addicted) or (sim_addicted + sim_not_addicted == 0):
            addiction_percent = 0
        else:
            addiction_percent = sim_addicted / (sim_addicted + sim_not_addicted) * 100

        predicted_class = "Addicted" if sim_addicted > sim_not_addicted else "Not Addicted"

        return jsonify({
            "addiction_percent": round(addiction_percent, 2),
            "predicted_class": predicted_class
        })

    except Exception as e:
        print("Error processing request:", e)
        return jsonify({"error": "Internal server error"}), 500

# =========================
# STORE RESULTS ROUTE
# =========================
@app.route('/store_results', methods=['POST'])
def store_results():
    try:
        data = request.json
        # Store in a local JSON file (you can modify to store in DB)
        with open("results.json", "a") as f:
            f.write(json.dumps(data) + "\n")
        return jsonify({"status": "success"}), 200
    except Exception as e:
        print("Error storing results:", e)
        return jsonify({"error": "Internal server error"}), 500

# =========================
# RUN APP
# =========================
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
