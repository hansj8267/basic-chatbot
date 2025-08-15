// --- 사이드바 기능 ---
const sections = {
  chatBtn: "chat-section",
  assignmentBtn: "assignments-section",
  weatherBtn: "weather-section",
  fortuneBtn: "fortune-section"
};
Object.keys(sections).forEach(id => {
  document.getElementById(id).addEventListener("click", () => {
    Object.values(sections).forEach(sec => document.getElementById(sec).classList.add("hidden"));
    document.getElementById(sections[id]).classList.remove("hidden");
  });
});

// --- 챗봇 ---
const responses = { "안녕": "안녕하세요. 반갑습니다.", "이름": "저는 챗봇입니다." };
document.getElementById("chat-form").addEventListener("submit", e => {
  e.preventDefault();
  const text = document.getElementById("messageInput").value.trim();
  const reply = responses[text] || "잘 모르겠어요!";
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
    const dueDate = new Date(task.date);
    const today = new Date();
    const diffDays = Math.ceil((dueDate - today)/(1000*60*60*24));
    const div = document.createElement("div");
    div.className = "assignment-card";
    div.innerHTML = `<strong>${task.date}</strong>: ${task.task} (남은 ${diffDays}일) 
                     <button class="delete-btn" onclick="deleteAssignment(${task.id})">삭제</button>`;
    box.appendChild(div);
  });
}

async function deleteAssignment(id) {
  await fetch("/api/assignments/delete", { method:"POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({id}) });
  fetchAssignments();
}

document.getElementById("assignment-form").addEventListener("submit", async e => {
  e.preventDefault();
  const date = document.getElementById("assignmentDate").value;
  const task = document.getElementById("assignmentTask").value;
  await fetch("/api/assignments/add", { method:"POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({date,task}) });
  fetchAssignments();
  document.getElementById("assignmentDate").value="";
  document.getElementById("assignmentTask").value="";
});
fetchAssignments();

// --- 날씨 ---
// 날씨
async function loadWeather() {
  document.getElementById("weatherResult").innerText = "불러오는 중...";
  try {
    const res = await fetch("/api/weather");
    const data = await res.json();

    if (data.error) {
      document.getElementById("weatherResult").innerText = "날씨 데이터를 불러올 수 없습니다.";
      return;
    }

    if (data.city && data.tempK) {
      const celsius = (data.tempK - 273.15).toFixed(1);
      document.getElementById("weatherCity").value = data.city;
      document.getElementById("weatherResult").innerText = `날씨: ${celsius}°C`;
    }
  } catch (err) {
    document.getElementById("weatherResult").innerText = "오류 발생: " + err.message;
  }
}



// --- 운세 ---
async function loadFortune() {
  const res = await fetch("/api/fortune");
  const data = await res.json();
  document.getElementById("fortuneResult").innerText = data.fortune;
}
document.getElementById("refreshFortuneBtn").addEventListener("click", loadFortune);
loadFortune();
