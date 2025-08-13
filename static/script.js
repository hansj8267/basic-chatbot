function showScreen(name){
    const screens = ['chat','assignments','verse','weather'];
    screens.forEach(s => document.getElementById(s+'Screen').style.display = 'none');
    document.getElementById(name+'Screen').style.display = 'block';
  }
  showScreen('chat');
  
  const responses = {"안녕":"안녕하세요.","이름":"저는 챗봇입니다."};
  document.getElementById("chat-form").addEventListener("submit", e=>{
    e.preventDefault();
    const text = document.getElementById("messageInput").value.trim();
    let reply = responses[text] || "잘 모르겠어요!";
    document.getElementById("replyBox").innerText = reply;
  });
  
  // 과제
  async function loadAssignments(){
    const res = await fetch("/api/assignments");
    const tasks = await res.json();
    const box = document.getElementById("assignmentsBox");
    box.innerHTML = "";
    tasks.forEach(t=>{
      const div = document.createElement("div");
      div.innerHTML = `<strong>${t.date}</strong> ${t.task} <button onclick='deleteAssignment(${t.id})'>삭제</button>`;
      box.appendChild(div);
    });
  }
  async function addAssignment(){
    const date = document.getElementById("taskDate").value;
    const task = document.getElementById("taskText").value;
    if(!date || !task) return;
    await fetch("/api/assignments/add", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({date,task})
    });
    document.getElementById("taskText").value="";
    loadAssignments();
  }
  async function deleteAssignment(id){
    await fetch("/api/assignments/delete", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({id})
    });
    loadAssignments();
  }
  loadAssignments();
  
  // 성경 말씀
  function getTodayVerse(){
    const verses = [
      "요한복음 3:16 하나님이 세상을 이처럼 사랑하사",
      "시편 23:1 여호와는 나의 목자시니",
      "빌립보서 4:13 내가 능력 주시는 자 안에서 모든 것을 할 수 있느니라"
    ];
    document.getElementById("verseBox").innerText = verses[Math.floor(Math.random()*verses.length)];
  }
  getTodayVerse();
  
  // 날씨
  async function loadWeather(){
    const res = await fetch("/api/weather");
    const data = await res.json();
    if(data.city){
      document.getElementById("cityInput").value = data.city;
      document.getElementById("weatherBox").innerText = data.weather;
    } else document.getElementById("weatherBox").innerText = "도시를 저장해주세요.";
  }
  async function saveCity(){
    const city = document.getElementById("cityInput").value.trim();
    if(!city) return;
    await fetch("/api/weather/save", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({city})
    });
    loadWeather();
  }
  loadWeather();
  