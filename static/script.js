// --- 챗봇 ---
const responses = {
  "안녕": "안녕하세요. 반갑습니다.",
  "이름": "저는 챗봇입니다."
};

document.getElementById("chat-form").addEventListener("submit", async e => {
  e.preventDefault();
  const text = document.getElementById("messageInput").value.trim();
  let reply = responses[text] || "잘 모르겠어요!";
  document.getElementById("replyBox").innerHTML = `<strong>챗봇:</strong> ${reply}`;
  document.getElementById("messageInput").value = "";
});

// --- 과제 ---
async function fetchAssignments() {
  const res = await fetch("/api/assignments");
  const data = await res.json();
  const box = document.getElementById("assignmentsBox");
  box.innerHTML = "";
  data.forEach(task => {
    const div = document.createElement("div");
    div.className = "assignment-card";
    div.innerHTML = `<strong>${task.date}</strong>: ${task.task} 
                     <button class="delete-btn" onclick="deleteAssignment(${task.id})">삭제</button>`;
    box.appendChild(div);
  });
}

async function deleteAssignment(id) {
  await fetch("/api/assignments/delete", {
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({id})
  });
  fetchAssignments();
}

document.getElementById("assignment-form").addEventListener("submit", async e => {
  e.preventDefault();
  const date = document.getElementById("assignmentDate").value;
  const task = document.getElementById("assignmentTask").value;
  await fetch("/api/assignments/add", {
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({date,task})
  });
  fetchAssignments();
  document.getElementById("assignmentDate").value="";
  document.getElementById("assignmentTask").value="";
});
fetchAssignments();

// --- 운세 ---
async function loadFortune() {
  const res = await fetch("/api/fortune");
  const data = await res.json();
  document.getElementById("fortuneResult").innerText = data.fortune;
}
document.getElementById("refreshFortuneBtn").addEventListener("click", loadFortune);
loadFortune();

// --- 성경 말씀 ---
async function loadBible() {
  try {
    const apiKey = "be163d8b2d1c5fd2c46fe81f527a1e93"; // 발급받은 API 키
    const bibleId = "krv"; // Korean Revised Version
    const verseId = "jhn.1.1"; // 요한복음 1장 1절

    const res = await fetch(`https://api.scripture.api.bible/v1/bibles/${bibleId}/verses/${verseId}`, {
      headers: {
        "api-key": "be163d8b2d1c5fd2c46fe81f527a1e93" 
      }
    });

    const data = await res.json();

    // API 응답에서 구절 가져오기
    const verseText = data.data.content || data.data.verse || "구절을 불러올 수 없습니다.";

    // 화면에 표시
    document.getElementById("bibleResult").innerText = `오늘의 구절: ${verseText}`;
  } catch (err) {
    document.getElementById("bibleResult").innerText = "불러오는 중 오류가 발생했습니다.";
    console.error(err);
  }
}

// 새로 고침 버튼 연결
document.getElementById("refreshBibleBtn").addEventListener("click", loadBible);

// 페이지 로드 시 자동 호출
loadBible();


// --- 날씨 ---
async function loadWeather() {
  const res = await fetch("/api/weather");
  const data = await res.json();
  if (data.city) {
    document.getElementById("weatherCity").value = data.city;
    document.getElementById("weatherResult").innerText = data.weather;
  }
}

document.getElementById("saveWeatherBtn").addEventListener("click", async () => {
  const city = document.getElementById("weatherCity").value;
  await fetch("/api/weather/save", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({city})
  });
  loadWeather();
});

loadWeather();

// --- 시계 ---
function updateClock() {
  document.getElementById('clock').textContent = new Date().toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();
