import json
import os
from pathlib import Path
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10 MB upload limit

DATA_FILE   = Path(__file__).parent / "data" / "portfolio.json"
RESUME_FILE = Path(__file__).parent / "static" / "resume.pdf"


def load_data() -> dict:
    with open(DATA_FILE, encoding="utf-8") as f:
        return json.load(f)


@app.route("/")
def index():
    return render_template("index.html", data=load_data())


@app.route("/api/resume", methods=["POST"])
def upload_resume():
    """Save an uploaded PDF to static/resume.pdf, then re-parse with the script."""
    if "resume" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["resume"]
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Must be a PDF"}), 400

    file.save(RESUME_FILE)
    return jsonify({"ok": True, "message": "Saved. Run  python scripts/parse_resume.py  to refresh data."})


if __name__ == "__main__":
    app.run(debug=True, port=5001)
