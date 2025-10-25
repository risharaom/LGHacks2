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
// ICEBREAKERS & CHAT FLOW
// =========================
const conversationFlow = [
  { id: "icebreaker1", question: "Hey there! How are you feeling today?", next: (a) => a.toLowerCase().includes("good") || a.toLowerCase().includes("fine") ? "icebreaker2" : "followup1" },
  { id: "icebreaker2", question: "Glad to hear that 😊! What’s been the highlight of your week?", next: () => "followup2" },
  { id: "followup1", question: "I’m sorry to hear that 😔. Would you like to share what's been bothering you?", next: () => "followup2" },
  { id: "followup2", question: "When you feel stressed or upset, what helps you cope or feel better?", next: () => "wrapup" },
  { id: "wrapup", question: "Thanks for sharing! Would you like to do a quick check to understand your habits better?", next: () => null }
];

// =========================
// WELLNESS QUESTIONS BY CATEGORY (MULTIPLE OPTIONS)
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

// Generate subtleQuestions by picking a random question from each category
let subtleQuestions = [];
for (const section in wellnessSections) {
  const options = wellnessSections[section];
  const randomQuestion = options[Math.floor(Math.random() * options.length)];
  subtleQuestions.push({ section, question: randomQuestion });
}

let subtleAnswers = [];
let currentQuestionIndex = 0;
let waitingForComfort = false;

// =========================
// DRUG DETECTION
// =========================
const drugKeywords = [
  "heroin", "cocaine", "weed", "marijuana", "ganja", "hash", "ecstasy", "molly",
  "lsd", "acid", "vape", "nicotine", "cannabis", "gabapentin", "etizolam",
  "2-dpmp", "tobacco", "fags", "baccy", "balloons", "nitrous oxide", "fentanyl",
  "acetylfentanyl", "opioid", "opiate", "drugs"
];

function detectDrugMention(message) {
  return drugKeywords.some(drug => message.toLowerCase().includes(drug));
}

function notifyDoctor(userMessage) {
  console.log("🚨 ALERT: Doctor notified about potential drug mention.");
  console.log("User message:", userMessage);
}

// =========================
// CHAT FUNCTIONS
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
// SEND SUBTLE ANSWERS TO FLASK
// =========================
async function sendSubtleAnswers() {
  try {
    const response = await fetch('http://127.0.0.1:5000/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ responses: subtleAnswers })
    });
    const data = await response.json();

    addMessage(`🧠 Sentiment Analysis: ${data.sentiments.join(', ')}`, false);
    addMessage(`💊 Predicted Addiction: ${data.predicted_class} (${data.addiction_percent.toFixed(1)}%)`, false);

    if (data.predicted_class === "Addicted" && data.addiction_percent > 50) {
      addMessage("It seems your responses indicate possible addictive patterns. 💡 Try seeking support, replacing habits with healthy routines, and talking to a professional.", false);
    } else {
      addMessage("Your responses suggest moderate stress or anxiety. 💡 Consider mindfulness exercises, journaling, or talking with someone you trust.", false);
    }
  } catch (err) {
    console.error("Error sending data to backend:", err);
    addMessage("⚠️ Failed to analyze responses. Please try again.", false);
  }
}

// =========================
// SEND MESSAGE MAIN
// =========================
function sendMessageHandler() {
  const message = chatInput.value.trim();
  if (!message) return;

  addMessage(message, true);
  chatInput.value = '';

  if (detectDrugMention(message)) {
    addMessage("It seems you mentioned something related to drugs. 💬 Here are some trusted resources:", false);
    notifyDoctor(message);
    return;
  }

  if (waitingForComfort) {
    waitingForComfort = false;
    if (currentQuestionIndex < subtleQuestions.length) {
      setTimeout(() => addMessage(subtleQuestions[currentQuestionIndex].question, false), 800);
    } else {
      addMessage("Analyzing your responses... 🔍", false);
      setTimeout(sendSubtleAnswers, 1000);
    }
    return;
  }

  if (currentQuestionIndex < subtleQuestions.length) {
    subtleAnswers.push(message.toLowerCase().includes("yes") ? 1 : 0);

    const comfortPhrases = [
      "Thanks for sharing that, it's okay to feel that way.",
      "I hear you. You're doing great by opening up.",
      "That's completely normal, many people feel this way sometimes.",
      "I appreciate your honesty — you're taking a positive step by reflecting."
    ];
    addMessage(comfortPhrases[Math.floor(Math.random() * comfortPhrases.length)], false);

    currentQuestionIndex++;
    waitingForComfort = true;
  } else {
    const currentQuestion = conversationFlow.find(q => q.id === currentQuestionId);
    let nextId = currentQuestion?.next ? currentQuestion.next(message) : null;

    if (currentQuestionId === "wrapup") {
      setTimeout(() => addMessage("Alright 💬 Let’s start your wellness check. Answer each with 'Yes' or 'No'.", false), 800);
      setTimeout(() => addMessage(subtleQuestions[currentQuestionIndex].question, false), 1200);
      return;
    }

    if (nextId) {
      currentQuestionId = nextId;
      const nextQuestion = conversationFlow.find(q => q.id === currentQuestionId);
      setTimeout(() => addMessage(nextQuestion.question, false), 800);
    } else {
      setTimeout(() => addMessage("Thanks for sharing 💬. I’ll pass this info to my analysis system.", false), 800);
    }
  }
}

// =========================
// EVENT LISTENERS
// =========================
sendBtn.addEventListener('click', sendMessageHandler);
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessageHandler(); });
chatInput.addEventListener('input', () => { sendBtn.disabled = !chatInput.value.trim(); });

// =========================
// INIT
// =========================
let currentQuestionId = "icebreaker1";
let inWellnessMode = false;
sendBtn.disabled = true;
setTimeout(() => addMessage(conversationFlow.find(q => q.id === "icebreaker1").question, false), 800);
