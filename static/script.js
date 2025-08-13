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
  const res = await fetch("/api/bible");
  const data = await res.json();
  document.getElementById("bibleResult").innerText = `"${data.verse}" (${data.reference})`;
}
document.getElementById("refreshBibleBtn").addEventListener("click", loadBible);
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
// --- 시계 ---
function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString("ko-KR", { hour12: false });
  document.getElementById("clock").innerText = timeString;
}
setInterval(updateClock, 1000);
updateClock();

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
