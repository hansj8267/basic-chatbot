from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import sqlite3, os, requests, urllib.parse

app = Flask(__name__)
app.secret_key = os.urandom(24)  # 세션 암호화 키

# --- API 키 (OpenWeather) ---
API_KEY = "6db5463fa2ed35f609952d658b208a34"

# --- DB 경로 ---
DB_PATH = "chatbot.db"

# --- DB 초기화 ---
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""CREATE TABLE IF NOT EXISTS users (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 username TEXT UNIQUE,
                 password TEXT,
                 name TEXT
                 )""")
    c.execute("""CREATE TABLE IF NOT EXISTS assignments (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 user_id INTEGER,
                 date TEXT,
                 task TEXT
                 )""")
    c.execute("""CREATE TABLE IF NOT EXISTS weather (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 user_id INTEGER,
                 city TEXT
                 )""")
    conn.commit()
    conn.close()

init_db()

# --- 좌표 가져오기 ---
def get_coords(city):
    city_encoded = urllib.parse.quote(city)
    url = f"http://api.openweathermap.org/geo/1.0/direct?q={city_encoded}&limit=1&appid={API_KEY}"
    response = requests.get(url)
    if response.status_code == 200 and response.json():
        data = response.json()[0]
        return data["lat"], data["lon"]
    return None, None

# --- 날씨 정보 가져오기 ---
def get_weather(city):
    lat, lon = get_coords(city)
    if lat is None:
        return f"'{city}'의 좌표를 찾을 수 없습니다."
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric&lang=kr"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        desc = data["weather"][0]["description"]
        temp = data["main"]["temp"]
        return f"{desc}, 온도: {temp}°C"
    return "날씨 정보를 가져오는데 실패했습니다."

# --- 로그인 ---
@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        name = request.form["name"]

        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE username=?", (username,))
        user = c.fetchone()

        if not user:
            # 신규 유저 생성
            c.execute("INSERT INTO users (username,password,name) VALUES (?,?,?)",
                      (username, password, name))
            conn.commit()
            user_id = c.lastrowid
        else:
            # 기존 유저 로그인
            if user[2] != password:
                conn.close()
                return "비밀번호가 틀렸습니다."
            user_id = user[0]
            name = user[3]

        session["user_id"] = user_id
        session["name"] = name
        conn.close()
        return redirect(url_for("chat"))

    return render_template("login.html")

# --- 챗봇 화면 ---
@app.route("/chat")
def chat():
    if "user_id" not in session:
        return redirect(url_for("login"))
    return render_template("chat.html", name=session["name"])

# --- 과제 목록 조회 ---
@app.route("/api/assignments")
def get_assignments():
    user_id = session.get("user_id")
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id,date,task FROM assignments WHERE user_id=?", (user_id,))
    tasks = [{"id": row[0], "date": row[1], "task": row[2]} for row in c.fetchall()]
    conn.close()
    return jsonify(tasks)

# --- 과제 추가 ---
@app.route("/api/assignments/add", methods=["POST"])
def add_assignment():
    user_id = session.get("user_id")
    data = request.json
    date = data.get("date")
    task = data.get("task")
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT INTO assignments (user_id,date,task) VALUES (?,?,?)", (user_id, date, task))
    conn.commit()
    conn.close()
    return jsonify({"status": "ok"})

# --- 과제 삭제 ---
@app.route("/api/assignments/delete", methods=["POST"])
def delete_assignment():
    user_id = session.get("user_id")
    data = request.json
    task_id = data.get("id")
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("DELETE FROM assignments WHERE id=? AND user_id=?", (task_id, user_id))
    conn.commit()
    conn.close()
    return jsonify({"status": "ok"})

# --- 날씨 불러오기 ---
@app.route("/api/weather")
def get_user_weather():
    user_id = session.get("user_id")
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT city FROM weather WHERE user_id=?", (user_id,))
    row = c.fetchone()
    conn.close()
    if row:
        city = row[0]
        return jsonify({"city": city, "weather": get_weather(city)})
    return jsonify({"city": None, "weather": None})

# --- 날씨 저장 ---
@app.route("/api/weather/save", methods=["POST"])
def save_weather():
    user_id = session.get("user_id")
    city = request.json.get("city")
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT * FROM weather WHERE user_id=?", (user_id,))
    if c.fetchone():
        c.execute("UPDATE weather SET city=? WHERE user_id=?", (city, user_id))
    else:
        c.execute("INSERT INTO weather (user_id,city) VALUES (?,?)", (user_id, city))
    conn.commit()
    conn.close()
    return jsonify({"status": "ok"})

# --- 실행 ---
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
