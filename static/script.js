// --- 챗봇 ---
const responses = {"안녕":"안녕하세요!","이름":"저는 챗봇입니다."};
document.getElementById("chat-form").addEventListener("submit", async e=>{
  e.preventDefault();
  const text = document.getElementById("messageInput").value.trim();
  const reply = responses[text]||"잘 모르겠어요!";
  document.getElementById("replyBox").innerHTML = `<strong>챗봇:</strong> ${reply}`;
  document.getElementById("messageInput").value="";
});

// --- 사이드바 ---
function showSection(id){
  document.querySelectorAll(".section").forEach(s=>s.style.display="none");
  document.getElementById(id).style.display="block";
}

// --- 과제 ---
async function fetchAssignments(dateFilter=null){
  const res = await fetch("/api/assignments");
  const data = await res.json();
  const box = document.getElementById("assignmentsBox");
  box.innerHTML = "";
  data.forEach(task=>{
    if(dateFilter && task.date !== dateFilter) return;
    const due = Math.ceil((new Date(task.date) - new Date())/(1000*60*60*24));
    const div = document.createElement("div");
    div.className = "assignment-card";
    div.innerHTML = `<strong>${task.date}</strong>: ${task.task} (남은 ${due}일) 
                     <button class="check-btn" onclick="checkAssignment(${task.id}, this)">${task.checked?"✔":"☐"}</button>
                     <button class="delete-btn" onclick="deleteAssignment(${task.id})">삭제</button>`;
    box.appendChild(div);
  });
}
async function deleteAssignment(id){ await fetch("/api/assignments/delete",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})}); fetchAssignments();}
async function checkAssignment(id, btn){ await fetch("/api/assignments/check",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})}); btn.innerText = btn.innerText==="☐"?"✔":"☐"; }
document.getElementById("assignment-form").addEventListener("submit", async e=>{
  e.preventDefault();
  const date=document.getElementById("assignmentDate").value;
  const task=document.getElementById("assignmentTask").value;
  await fetch("/api/assignments/add",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({date,task})});
  fetchAssignments();
  document.getElementById("assignmentDate").value=""; document.getElementById("assignmentTask").value="";
});
document.getElementById("filterDate").addEventListener("change", e=>fetchAssignments(e.target.value));
fetchAssignments();

// --- 날씨 ---
const API_KEY="6db5463fa2ed35f609952d658b208a34";
async function loadWeather(){
  const res = await fetch("/api/weather");
  const data = await res.json();
  if(data.city){
    document.getElementById("weatherCity").value=data.city;
    document.getElementById("weatherResult").innerText = `${data.weather.temp}°F, ${data.weather.description}`;
  }
}
document.getElementById("saveWeatherBtn").addEventListener("click", async ()=>{
  const city = document.getElementById("weatherCity").value;
  await fetch("/api/weather/save",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({city})});
  loadWeather();
});
loadWeather();

// --- 운세 ---
async function loadFortune(){ const res=await fetch("/api/fortune"); const data=await res.json(); document.getElementById("fortuneResult").innerText=data.fortune; }
document.getElementById("refreshFortuneBtn").addEventListener("click", loadFortune);
loadFortune();

// --- 성경 ---
async function loadBible(){ const res=await fetch("/api/bible"); const data=await res.json(); document.getElementById("bibleResult").innerText=`"${data.verse}" (${data.reference})`; }
document.getElementById("refreshBibleBtn").addEventListener("click", loadBible);
loadBible();
