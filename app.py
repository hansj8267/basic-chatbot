from flask import Flask, render_template, request, redirect, session, jsonify
import sqlite3, os, requests
from datetime import datetime

app = Flask(__name__)
app.secret_key = os.urandom(24)

DB_PATH = "assignments.db"
WEATHER_API_KEY = "6db5463fa2ed35f609952d658b208a34"

# --- DB 초기화 ---
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        task TEXT NOT NULL,
        checked INTEGER DEFAULT 0
    )""")
    conn.commit()
    conn.close()

init_db()

# --- 로그인 페이지 ---
@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        name = request.form.get("name") or "게스트"
        session["name"] = name
        return redirect("/chat")
    return render_template("login.html")

# --- 챗봇 페이지 ---
@app.route("/chat", methods=["GET", "POST"])
def chat():
    # POST로 로그인 요청이 들어왔을 경우 처리
    if request.method == "POST":
        name = request.form.get("name") or "게스트"
        session["name"] = name
    name = session.get("name", "게스트")
    return render_template("chat.html", name=name)

# --- 과제 API ---
@app.route("/api/assignments")
def get_assignments():
    today = datetime.now().date()
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id,date,task,checked FROM assignments")
    tasks = []
    for r in c.fetchall():
        due_date = datetime.strptime(r[1], "%Y-%m-%d").date()
        days_left = (due_date - today).days
        tasks.append({
            "id": r[0],
            "date": r[1],
            "task": r[2],
            "checked": bool(r[3]),
            "days_left": days_left
        })
    conn.close()
    return jsonify(tasks)

@app.route("/api/assignments/add", methods=["POST"])
def add_assignment():
    data = request.get_json()
    date, task = data.get("date"), data.get("task")
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT INTO assignments(date,task) VALUES (?,?)", (date, task))
    conn.commit()
    conn.close()
    return jsonify({"status": "ok"})

@app.route("/api/assignments/delete", methods=["POST"])
def delete_assignment():
    data = request.get_json()
    id = data.get("id")
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("DELETE FROM assignments WHERE id=?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"status": "ok"})

@app.route("/api/assignments/check", methods=["POST"])
def check_assignment():
    data = request.get_json()
    id = data.get("id")
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("UPDATE assignments SET checked = 1 - checked WHERE id=?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"status": "ok"})

# --- 날씨 API ---
# app.py
@app.route("/api/weather")
def get_weather():
    city = session.get("city", "Seoul")
    api_key = WEATHER_API_KEY

    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}"
        res = requests.get(url)
        res.raise_for_status()
        data = res.json()

        if "main" in data and "temp" in data["main"]:
            tempK = data["main"]["temp"]
            return jsonify({"city": city, "tempK": tempK})
        else:
            return jsonify({"error": "날씨 데이터를 찾을 수 없습니다."}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- 운세 API ---
@app.route("/api/fortune")
def get_fortune():
    fortunes = ["행운이 찾아옵니다.", "오늘은 좋은 하루입니다.", "조금 주의가 필요합니다."]
    import random
    return jsonify({"fortune": random.choice(fortunes)})

# --- 성경 말씀 API ---
@app.route("/api/bible")
def get_bible():
    verse = "태초에 하나님이 천지를 창조하시니라."
    reference = "창세기 1:1"
    return jsonify({"verse": verse, "reference": reference})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
