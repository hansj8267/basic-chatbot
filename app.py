from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import os
import sqlite3
import requests
import urllib.parse
import random
from datetime import datetime

app = Flask(__name__)
app.secret_key = os.urandom(24)  # 세션 암호화 키

DB_PATH = "users.db"

# ---------- DB 초기화 ----------
def init_db():
    if not os.path.exists(DB_PATH):
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("""
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                password TEXT NOT NULL
            )
        """)
        conn.commit()
        conn.close()

init_db()

# ---------- 로그인 ----------
@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        name = request.form.get("name")
        password = request.form.get("password")

        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE name=? AND password=?", (name, password))
        user = c.fetchone()
        conn.close()

        if user:
            session["name"] = name
            return redirect(url_for("chat"))
        else:
            return render_template("login.html", error="이름 또는 비밀번호가 잘못되었습니다.")

    return render_template("login.html")

# ---------- 회원가입 ----------
@app.route("/register", methods=["POST"])
def register():
    name = request.form.get("name")
    password = request.form.get("password")

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT INTO users (name, password) VALUES (?, ?)", (name, password))
    conn.commit()
    conn.close()

    session["name"] = name
    return redirect(url_for("chat"))

# ---------- 채팅 ----------
@app.route("/chat")
def chat():
    name = session.get("name", "게스트")
    return render_template("chat.html", name=name)

# ---------- 로그아웃 ----------
@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))

# ---------- 날씨 API ----------
API_KEY = "6db5463fa2ed35f609952d658b208a34"

@app.route("/weather/<city>")
def get_weather(city):
    url = f"http://api.openweathermap.org/data/2.5/weather?q={urllib.parse.quote(city)}&appid={API_KEY}&lang=kr&units=metric"
    res = requests.get(url).json()
    return jsonify(res)

if __name__ == "__main__":
    app.run(debug=True)
