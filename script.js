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
mobileMenuBtn.addEventListener('click', () => mobileMenu.classList.toggle('active'));
document.addEventListener('click', e => {
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
// ALERT DETECTION
// =========================
const conversationFlow = [
  { id: "icebreaker1", question: "Hey there! How are you feeling today?", next: (answer) => (answer.toLowerCase().includes("good") || answer.toLowerCase().includes("fine")) ? "icebreaker2" : "followup1" },
  { id: "icebreaker2", question: "Glad to hear that 😊! How has your week been so far?", next: () => "followup2" },
  { id: "followup1", question: "I’m sorry to hear that. What’s been on your mind lately?", next: () => "followup2" },
  { id: "followup2", question: "When you’re stressed or upset, what do you usually do to feel better?", next: (answer) => {
      if (answer.toLowerCase().includes("friends")) return "followup3_friends";
      if (answer.toLowerCase().includes("alone")) return "followup3_alone";
      return "followup3_generic";
    } 
  },
  { id: "followup3_friends", question: "That’s great that you have supportive friends! Do you ever feel like they influence your habits or choices?", next: () => "wrapup" },
  { id: "followup3_alone", question: "It sounds like you prefer handling things on your own. Does that ever get overwhelming?", next: () => "wrapup" },
  { id: "followup3_generic", question: "That’s one way to handle it. Has that been helping you lately?", next: () => "wrapup" },
  { id: "wrapup", question: "Thanks for sharing that. Would you like to keep chatting or take a quick mental wellness check?", next: () => null }
];

// =========================
// WELLNESS CHECK QUESTIONS
// =========================
const wellnessSections = {
  "Social Isolation": [
    "Have you intentionally withdrawn from social activities or friends recently?",
    "Do you frequently feel isolated or alone, even when you are with others?",
    "Are you spending significantly more time by yourself than you used to?",
    "Have you started avoiding family gatherings or social events?"
  ],
  "Financial Issues": [
    "Have you experienced financial difficulties or debt directly related to your habit?",
    "Are you frequently running out of money because of the cost of your addiction?",
    "Do you spend money on your addiction instead of essential items like food or tuition?"
  ],
  "Physical & Mental Health": [
    "Have you noticed a decline in your overall physical health since your habit started?",
    "Are you experiencing new or worsening mental health issues like anxiety or depression?",
    "Do you often feel sick, exhausted, or unwell because of your substance use?"
  ],
  "Relationship Strain": [
    "Has your addiction caused frequent arguments or conflicts with family members or friends?",
    "Do you find yourself lying to or hiding your activities from the people you care about?",
    "Are your relationships becoming strained or damaged by your behavior?"
  ],
  "Withdrawal Symptoms": [
    "When you stop using your habit, do you experience physical discomfort or sickness?",
    "Do you get anxious or restless if you cannot engage in your habit?",
    "Do you need to use the substance just to feel 'normal'?"
  ],
  "Risk-Taking Behavior": [
    "Have you engaged in dangerous or reckless activities while under the influence?",
    "Do you take significant risks to obtain the substance or engage in your habit?",
    "Have you ever had an accident directly related to your substance use?"
  ]
};

let wellnessQuestions = [];
for (const section in wellnessSections) {
  wellnessQuestions.push({ section, questions: wellnessSections[section] });
}

// =========================
// DRUG DETECTION SYSTEM
// =========================
const drugKeywords = [
  "heroin","cocaine","weed","marijuana","ganja","hash","ecstasy","molly",
  "lsd","acid","vape","nicotine","cannabis","gabapentin","etizolam",
  "2-dpmp","tobacco","fags","baccy","balloons","nitrous oxide","fentanyl",
  "acetylfentanyl","opioid","opiate","drugs"
];

function detectDrugMention(message) {
  const lower = message.toLowerCase();
  return drugKeywords.some(drug => lower.includes(drug));
}

function notifyDoctor(userMessage) {
  console.log("🚨 ALERT: Doctor notified about potential drug mention.");
  console.log("User message:", userMessage);
}

// Respond when drug mentioned
function respondToDrugMention() {
  addMessage("It sounds like you mentioned something related to drugs or substances. 💬", false);
  setTimeout(() => {
    addMessage("If you're struggling, you're not alone. Here are trusted resources:", false);
    setTimeout(() => {
      addMessage(`📞 SAMHSA Helpline: 1-800-662-4357  
💬 Crisis Text Line: Text HELLO to 741741  
🌐 Visit [findtreatment.gov](https://findtreatment.gov)`, false);
    }, 1000);
  }, 700);
}

// =========================
// CHAT STATE
// =========================
let icebreakerIndex = 0;
let mainQuestionIndex = 0;
let inTellMeMore = false;
let wellnessAnswers = [];
let finishedMainQuestions = false;

// =========================
// ADD MESSAGE
// =========================
function addMessage(text, isUser=false){
  const div = document.createElement('div');
  div.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.innerHTML = text;
  div.appendChild(bubble);
  chatMessages.appendChild(div);
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

  if (detectDrugMention(message)) {
    respondToDrugMention();
    notifyDoctor(message);
    return;
  }

  if(icebreakerIndex < icebreakers.length){
    icebreakerIndex++;
    if(icebreakerIndex < icebreakers.length){
      setTimeout(()=> addMessage(icebreakers[icebreakerIndex], false), 700);
    } else {
      setTimeout(()=> askNextMainQuestion(), 700);
    }
    return;
  }

  const currentQuestion = conversationFlow.find(q => q.id === currentQuestionId);
  let nextQuestionId = currentQuestion?.next ? currentQuestion.next(message) : null;

  if (currentQuestionId === "wrapup") {
    if (message.toLowerCase().includes("yes") || message.toLowerCase().includes("check")) {
      inWellnessMode = true;
      setTimeout(() => {
        addMessage("Alright 💬 Let’s start your quick wellness check. Answer with Yes/No.", false);
        setTimeout(() => askNextWellnessQuestion(), 1200);
      }, 800);
      return;
    } else {
      setTimeout(() => addMessage("No worries 💛 I’m here if you want to chat.", false), 800);
      return;
    }
  }

  if (nextQuestionId) {
    currentQuestionId = nextQuestionId;
    const nextQuestion = conversationFlow.find(q => q.id === currentQuestionId);
    setTimeout(() => addMessage(nextQuestion.question, false), 800);
  } else {
    setTimeout(() => addMessage("Thanks for sharing 💬. I’ll analyze your well-being next.", false), 800);
  }
}

// =========================
// WELLNESS LOGIC
// =========================
function askNextWellnessQuestion() {
  const section = wellnessQuestions[currentWellnessSection];
  if (!section) {
    addMessage("That’s all for now 💭 Thank you for taking this check.", false);
    inWellnessMode = false;
    currentWellnessSection = 0;
    currentWellnessIndex = 0;
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
    if (currentWellnessSection < wellnessQuestions.length) {
      setTimeout(() => {
        addMessage(`Next section: ${wellnessQuestions[currentWellnessSection].section}`, false);
        setTimeout(() => askNextWellnessQuestion(), 1000);
      }, 800);
    } else {
      addMessage("That was the last section ✅. Sending responses for analysis...", false);
      inWellnessMode = false;
      setTimeout(analyzeWellnessResponses, 1000);
    }
  } else {
    setTimeout(() => askNextWellnessQuestion(), 700);
  }

  return feedback;
}

// =========================
// SEND WELLNESS RESPONSES TO BACKEND
// =========================
async function analyzeWellnessResponses() {
  try {
    addMessage("Analyzing your responses... 🔍", false);

    const mappedResponses = wellnessAnswers.map(ans => ans ? 1 : 0);

    const response = await fetch("http://127.0.0.1:5000/analyze", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({responses: wellnessAnswers})
    });

    const data = await response.json();

    addMessage(`💊 Addiction Score: ${data.addiction_percent.toFixed(1)}%`, false);
    addMessage(`Predicted Class: ${data.predicted_class}`, false);

    if (data.predicted_class === "Addicted" && data.addiction_percent >= 50) {
      addMessage("⚠️ Your responses indicate potential addictive patterns. Consider talking to a professional.", false);
    } else {
      addMessage("✅ Your responses suggest moderate stress. Mindfulness, journaling, or relaxation exercises can help.", false);
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

// Initialize chat
sendBtn.disabled = true;
setTimeout(() => addMessage(conversationFlow.find(q => q.id === "icebreaker1").question, false), 800);
