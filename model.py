# app.py
from flask import Flask, request, jsonify
import pandas as pd
import numpy as np

app = Flask(__name__)

# ------------------------------
# Load and clean addiction dataset
# ------------------------------
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

# ------------------------------
# Keyword-based sentiment
# ------------------------------
word_dict = {
    "love": 1, "amazing": 1, "good": 1, "great": 1, "happy": 1, "awesome": 1,
    "hate": 0, "terrible": 0, "bad": 0, "awful": 0, "sad": 0
}

def predict_text(text):
    text = text.lower().split()
    score = 0
    count = 0
    for word in text:
        if word in word_dict:
            score += word_dict[word]
            count += 1
    if count == 0:
        return 0
    return 1 if (score / count) >= 0.5 else 0

# ------------------------------
# Similarity function
# ------------------------------
def similarity_score(user, group):
    return group.apply(lambda row: (row.fillna(0) == user.fillna(0)).mean(), axis=1).mean()

# ------------------------------
# API endpoint
# ------------------------------
@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    # data expected to be: {"responses": ["I feel good", "I hate homework", ...]}
    responses = data.get("responses", [])

    # Step 1: Sentiment analysis
    sentiments = [predict_text(r) for r in responses]

    # Step 2: Addiction similarity
    user_input = pd.Series(sentiments, index=feature_cols[:len(sentiments)])
    sim_addicted = similarity_score(user_input, addicted)
    sim_not_addicted = similarity_score(user_input, not_addicted)

    if np.isnan(sim_addicted) or np.isnan(sim_not_addicted) or (sim_addicted + sim_not_addicted == 0):
        addiction_percent = 0
    else:
        addiction_percent = sim_addicted / (sim_addicted + sim_not_addicted) * 100

    predicted_class = "Addicted" if sim_addicted > sim_not_addicted else "Not Addicted"

    return jsonify({
        "sentiments": sentiments,
        "predicted_class": predicted_class,
        "addiction_percent": addiction_percent
    })

if __name__ == "__main__":
    app.run(debug=True)