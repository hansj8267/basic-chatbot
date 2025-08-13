/* ---------------- 로그인 처리 ---------------- */
document.getElementById("login-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  if (!name) return;
  localStorage.setItem("chatUser", name);
  // Flask 템플릿이라면 url_for 사용이 좋지만, 정적 html 테스트용으로 chat.html로 이동
  window.location.href = "/chat"; // Flask 라우트가 /chat 이라고 가정
});

/* ---------------- 환영 문구 ---------------- */
(function initWelcome() {
  const name = localStorage.getItem("chatUser");
  const el = document.getElementById("welcome-name");
  if (name && el) el.textContent = `${name}님, 환영합니다!`;
})();

/* ---------------- 화면 전환 ---------------- */
function showScreen(name) {
  // 모든 screen 숨김
  document.querySelectorAll(".screen").forEach((s) => (s.style.display = "none"));
  // 선택 화면 표시
  const target = document.getElementById(`${name}-screen`);
  if (target) target.style.display = "block";
  // 중앙 정렬 유지: chat-area는 항상 flex 중앙이므로 추가 조치 불필요
}
// 초기 화면
showScreen("chat");

/* ---------------- 챗봇 ---------------- */
const responses = {
  "안녕": "안녕하세요. 반갑습니다.",
  "이름": "저는 챗봇입니다."
};
const fortunes = [
  "오늘은 행운이 가득한 하루가 될 거예요! 🍀",
  "조심해야 할 일이 있을지도 몰라요. 🤔",
  "뜻밖의 기회가 찾아올 수 있어요!",
  "오늘은 평온하고 안정적인 하루가 될 거예요.",
  "누군가 당신을 도와줄 거예요. 🤝"
];

document.getElementById("chat-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("messageInput");
  if (!input) return;
  const text = input.value.trim();
  input.value = "";

  let reply = "";
  if (text === "운세") reply = fortunes[Math.floor(Math.random() * fortunes.length)];
  else if (text === "시간") reply = new Date().toLocaleString();
  else if (responses[text]) reply = responses[text];
  else reply = "잘 모르겠어요. 다른 질문을 해주세요!";

  const box = document.getElementById("replyBox");
  if (box) box.innerHTML = `<strong>챗봇:</strong> ${reply}`;
});

/* ---------------- 과제 (로컬 저장) ---------------- */
let assignments = JSON.parse(localStorage.getItem("assignments") || "{}");

function saveAssignments() {
  localStorage.setItem("assignments", JSON.stringify(assignments));
}
function renderAssignments() {
  const box = document.getElementById("assignmentsBox");
  if (!box) return;
  box.innerHTML = "";
  for (const date in assignments) {
    const card = document.createElement("div");
    card.className = "assignment-card";
    card.innerHTML = `
      <strong>${date}</strong>
      <ul>${assignments[date].map((t) => `<li>${t}</li>`).join("")}</ul>
      <button class="delete-btn" onclick="deleteAssignment('${date}')">삭제</button>
    `;
    box.appendChild(card);
  }
}
function deleteAssignment(date) {
  delete assignments[date];
  saveAssignments();
  renderAssignments();
}
renderAssignments();

/* ---------------- 시간 화면 ---------------- */
(function showTime(){
  const box = document.getElementById("timeBox");
  if (!box) return;
  const tick = () => (box.textContent = new Date().toLocaleString());
  tick();
  setInterval(tick, 1000);
})();
