// =========================
// DOM ELEMENTS
// =========================
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const navBtns = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');
const hero = document.getElementById('hero');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const chatMessages = document.getElementById('chatMessages');

// =========================
// MOBILE MENU
// =========================
mobileMenuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('active');
});
document.addEventListener('click', (e) => {
  if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
    mobileMenu.classList.remove('active');
  }
});

// =========================
// TAB NAVIGATION
// =========================
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.getAttribute('data-tab');
    navBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    tabContents.forEach(tab => tab.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');

    hero.style.display = tabName === 'chat' ? 'block' : 'none';
    mobileMenu.classList.remove('active');
  });
});

// =========================
// CONVERSATION FLOW
// =========================
const conversationFlow = [
  { id: "icebreaker1", question: "Hey there! How are you feeling today?", next: (answer) => (answer.toLowerCase().includes("good") || answer.toLowerCase().includes("fine")) ? "icebreaker2" : "followup1" },
  { id: "icebreaker2", question: "Glad to hear that 😊! How has your week been so far?", next: () => "followup2" },
  { id: "followup1", question: "I’m sorry to hear that. What’s been on your mind lately?", next: () => "followup2" },
  { id: "followup2", question: "When you’re stressed or upset, what do you usually do to feel better?", next: () => "wrapup" },
  { id: "wrapup", question: "Thanks for sharing that. Would you like to take a quick wellness check?", next: () => null }
];

// =========================
// WELLNESS QUESTIONS
// =========================
const wellnessSections = {
  "Social Isolation": [
    "Have you withdrawn from social activities or friends recently?",
    "Do you feel isolated or alone even when around others?"
  ],
  "Financial Issues": [
    "Have you had financial difficulties related to your habits?",
    "Do you spend money on your habit instead of essentials?"
  ],
  "Physical & Mental Health": [
    "Have you noticed health issues since your habit started?",
    "Do you often feel sick or anxious due to your habit?"
  ],
  "Relationship Strain": [
    "Has your habit caused conflicts with family or friends?",
    "Do you hide your activities from people you care about?"
  ],
  "Risk-Taking Behavior": [
    "Have you engaged in risky or dangerous activities?",
    "Have you had accidents related to your habit?"
  ]
};

let wellnessQuestions = [];
for (const section in wellnessSections) {
  wellnessQuestions.push({ section, questions: wellnessSections[section] });
}

// =========================
// CHAT STATE
// =========================
let currentQuestionId = "icebreaker1";
let inWellnessMode = false;
let currentWellnessSection = 0;
let currentWellnessIndex = 0;
const wellnessAnswers = [];

// =========================
// ADD MESSAGE
// =========================
function addMessage(text, isUser = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
  const bubbleDiv = document.createElement('div');
  bubbleDiv.className = 'message-bubble';
  const p = document.createElement('p');
  p.innerHTML = text;
  bubbleDiv.appendChild(p);
  messageDiv.appendChild(bubbleDiv);
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// =========================
// SEND MESSAGE
// =========================
function sendMessage() {
  const message = chatInput.value.trim();
  if (!message) return;
  addMessage(message, true);
  chatInput.value = '';

  if (inWellnessMode) {
    handleWellnessResponse(message);
    return;
  }

  const currentQuestion = conversationFlow.find(q => q.id === currentQuestionId);
  if (!currentQuestion) return;

  if (currentQuestionId === "wrapup") {
    if (message.toLowerCase().includes("yes")) {
      inWellnessMode = true;
      setTimeout(() => {
        addMessage("Alright 💬 Let’s start your wellness check. Answer with Yes/No.", false);
        setTimeout(askNextWellnessQuestion, 1000);
      }, 800);
    } else {
      setTimeout(() => addMessage("No problem 💛 I’m here if you want to talk.", false), 800);
    }
    return;
  }

  const nextQuestionId = currentQuestion.next ? currentQuestion.next(message) : null;
  if (nextQuestionId) {
    currentQuestionId = nextQuestionId;
    const nextQuestion = conversationFlow.find(q => q.id === currentQuestionId);
    setTimeout(() => addMessage(nextQuestion.question, false), 800);
  } else {
    setTimeout(() => addMessage("Thanks for sharing 💬", false), 800);
  }
}

// =========================
// WELLNESS CHECK LOGIC
// =========================
function askNextWellnessQuestion() {
  const section = wellnessQuestions[currentWellnessSection];
  if (!section) {
    addMessage("✅ Thank you for completing the check!", false);
    inWellnessMode = false;
    analyzeWellnessResponses();
    return;
  }

  const question = section.questions[currentWellnessIndex];
  addMessage(`${section.section} — ${question}`, false);
}

function handleWellnessResponse(answer) {
  wellnessAnswers.push(answer.toLowerCase().includes("yes") ? 1 : 0);

  const section = wellnessQuestions[currentWellnessSection];
  currentWellnessIndex++;

  if (currentWellnessIndex >= section.questions.length) {
    currentWellnessSection++;
    currentWellnessIndex = 0;
  }

  if (currentWellnessSection >= wellnessQuestions.length) {
    addMessage("That was the last question ✅ Analyzing now...", false);
    inWellnessMode = false;
    setTimeout(analyzeWellnessResponses, 1000);
  } else {
    setTimeout(askNextWellnessQuestion, 800);
  }
}

// =========================
// SEND RESPONSES TO BACKEND
// =========================
async function analyzeWellnessResponses() {
  try {
    addMessage("Analyzing your responses... 🔍", false);

    const mappedResponses = wellnessAnswers.map(ans => ans ? 1 : 0);
    const response = await fetch("http://127.0.0.1:5000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ responses: mappedResponses })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Server error:", data);
      addMessage("⚠️ Server returned an error. Please try again.", false);
      return;
    }

    if (!data || data.addiction_percent === undefined) {
      console.error("Malformed response:", data);
      addMessage("⚠️ Unexpected server response format.", false);
      return;
    }

    addMessage(`💊 Addiction Score: ${data.addiction_score}`, false);
    addMessage(`Predicted Class: ${data.predicted_class}`, false);
    addMessage(`Addiction Likelihood: ${data.addiction_percent.toFixed(1)}%`, false);

    if (data.predicted_class === "Addicted") {
      addMessage("⚠️ It seems your responses show strong addictive patterns. Please consider seeking professional help.", false);
    } else {
      addMessage("✅ Your responses suggest moderate or low risk. Keep maintaining healthy habits!", false);
    }

  } catch (err) {
    console.error("Error analyzing responses:", err);
    addMessage("⚠️ Failed to analyze responses. Please check your connection.", false);
  }
}

// =========================
// EVENT LISTENERS
// =========================
sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
chatInput.addEventListener('input', () => { sendBtn.disabled = !chatInput.value.trim(); });

// =========================
// INIT CHAT
// =========================
sendBtn.disabled = true;
setTimeout(() => addMessage(conversationFlow.find(q => q.id === "icebreaker1").question, false), 800);
