from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

# Load and clean dataset
df = pd.read_csv("student_addiction_dataset_train.csv")
feature_cols = df.columns[:-1]
target_col = 'Addiction_Class'

for col in feature_cols:
    if df[col].dtype == 'object':
        df[col] = df[col].astype(str).str.strip().str.lower().map({'yes': 1, 'no': 0})
    df[col] = df[col].fillna(0)

df[target_col] = df[target_col].map({'Yes': 1, 'No': 0}).fillna(0).astype(int)
addicted = df[df[target_col] == 1][feature_cols]
not_addicted = df[df[target_col] == 0][feature_cols]

# Similarity function
def similarity_score(user, group):
    return group.apply(lambda row: (row.fillna(0) == user.fillna(0)).mean(), axis=1).mean()

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    responses = data.get("responses", [])

    # Create user input aligned with feature columns
    # Pad or trim to match the number of features
    user_input = pd.Series(responses[:len(feature_cols)], index=feature_cols[:len(responses)])

    sim_addicted = similarity_score(user_input, addicted)
    sim_not_addicted = similarity_score(user_input, not_addicted)

    if np.isnan(sim_addicted) or np.isnan(sim_not_addicted) or (sim_addicted + sim_not_addicted == 0):
        addiction_percent = 0
    else:
        addiction_percent = sim_addicted / (sim_addicted + sim_not_addicted) * 100

    predicted_class = "Addicted" if sim_addicted > sim_not_addicted else "Not Addicted"

    return jsonify({
        "predicted_class": predicted_class,
        "addiction_percent": addiction_percent
    })

if __name__ == "__main__":
    app.run(debug=True)
