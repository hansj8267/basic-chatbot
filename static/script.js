// --- 사이드바 메뉴 전환 ---
function showSection(id) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(`section-${id}`).classList.add('active');
}

// --- 챗봇 ---
const responses = {"안녕":"안녕하세요. 반갑습니다.","이름":"저는 챗봇입니다."};
document.getElementById("chat-form").addEventListener("submit", async e=>{
    e.preventDefault();
    const text=document.getElementById("messageInput").value.trim();
    let reply=responses[text]||"잘 모르겠어요!";
    document.getElementById("replyBox").innerHTML=`<strong>챗봇:</strong> ${reply}`;
    document.getElementById("messageInput").value="";
});

// --- 과제 ---
async function fetchAssignments() {
  const res = await fetch("/api/assignments");
  const data = await res.json();
  const box = document.getElementById("assignmentsBox");
  box.innerHTML = "";
  data.forEach(task => {
    const due = new Date(task.date);
    const today = new Date();
    const diffDays = Math.ceil((due - today) / (1000*60*60*24));
    const div = document.createElement("div");
    div.className="assignment-card";
    div.innerHTML=`<strong>${task.date}</strong>: ${task.task} - ${diffDays}일 남음
                   <button class="delete-btn" onclick="deleteAssignment(${task.id})">삭제</button>`;
    box.appendChild(div);
  });
}
async function deleteAssignment(id){
  await fetch("/api/assignments/delete",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});
  fetchAssignments();
}
document.getElementById("assignment-form").addEventListener("submit", async e=>{
  e.preventDefault();
  const date=document.getElementById("assignmentDate").value;
  const task=document.getElementById("assignmentTask").value;
  await fetch("/api/assignments/add",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({date,task})});
  fetchAssignments();
  document.getElementById("assignmentDate").value="";
  document.getElementById("assignmentTask").value="";
});
fetchAssignments();

// --- 날씨 ---
async function loadWeather() {
  const res = await fetch("/api/weather");
  const data = await res.json();
  if(data.city){
    document.getElementById("weatherCity").value=data.city;
    document.getElementById("weatherResult").innerText=data.weather;
  }
}
document.getElementById("saveWeatherBtn").addEventListener("click", async ()=>{
  const city=document.getElementById("weatherCity").value;
  await fetch("/api/weather/save",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({city})});
  loadWeather();
});
loadWeather();

// --- 운세 ---
async function loadFortune(){
  const res=await fetch("/api/fortune");
  const data=await res.json();
  document.getElementById("fortuneResult").innerText=data.fortune;
}
document.getElementById("refreshFortuneBtn").addEventListener("click", loadFortune);
loadFortune();

// --- 성경 구절 ---
async function loadBible(){
  try{
    const res=await fetch("https://api.scripture.api.bible/v1/bibles/krv/verses/JHN.1.1",{
      headers: {"api-key":"be163d8b2d1c5fd2c46fe81f527a1e93"}
    });
    const data=await res.json();
    document.getElementById("bibleResult").innerText=`오늘의 구절: ${data.data.content}`;
  }catch(err){
    document.getElementById("bibleResult").innerText="불러오는 중 오류가 발생했습니다.";
    console.error(err);
  }
}
document.getElementById("refreshBibleBtn").addEventListener("click", loadBible);
loadBible();
