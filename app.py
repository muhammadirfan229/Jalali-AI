import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

app = Flask(__name__)
CORS(app)

api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise ValueError("OPENAI_API_KEY nahi mili.")

client = OpenAI(api_key=api_key)

SYSTEM_PROMPT = """
You are Jalali AI, a helpful AI assistant.

Help users with:
- General questions
- Ideas and brainstorming
- Study and learning
- Programming and coding
- AI and technology
- Business ideas
- Writing
- Career guidance
- Everyday problem solving

Reply naturally in the same language/style the user uses.
If the user uses Roman Urdu, reply in Roman Urdu.
If the user uses Urdu, reply in Urdu.
If the user uses English, reply in English.

Be helpful, clear and beginner-friendly.
"""

@app.route("/")
def home():
    return send_from_directory(".", "index.html")


@app.route("/style.css")
def style():
    return send_from_directory(".", "style.css")


@app.route("/script.js")
def script():
    return send_from_directory(".", "script.js")


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        messages = data.get("messages", [])

        response = client.responses.create(
            model="gpt-6-luna",
            instructions=SYSTEM_PROMPT,
            input=messages
        )

        return jsonify({
            "reply": response.output_text
        })

    except Exception as e:
        print("OPENAI ERROR:", repr(e))

        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)