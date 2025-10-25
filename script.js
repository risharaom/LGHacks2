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
  {
    id: "icebreaker1",
    question: "Hey there! How are you feeling today?",
    next: (answer) => {
      if (answer.toLowerCase().includes("good") || answer.toLowerCase().includes("fine")) return "icebreaker2";
      return "followup1";
    }
  },
  {
    id: "icebreaker2",
    question: "Glad to hear that 😊! How has your week been so far?",
    next: () => "followup2"
  },
  {
    id: "followup1",
    question: "I’m sorry to hear that. What’s been on your mind lately?",
    next: () => "followup2"
  },
  {
    id: "followup2",
    question: "When you’re stressed or upset, what do you usually do to feel better?",
    next: (answer) => {
      if (answer.toLowerCase().includes("friends")) return "followup3_friends";
      if (answer.toLowerCase().includes("alone")) return "followup3_alone";
      return "followup3_generic";
    }
  },
  {
    id: "followup3_friends",
    question: "That’s great that you have supportive friends! Do you ever feel like they influence your habits or choices?",
    next: () => "wrapup"
  },
  {
    id: "followup3_alone",
    question: "It sounds like you prefer handling things on your own. Does that ever get overwhelming?",
    next: () => "wrapup"
  },
  {
    id: "followup3_generic",
    question: "That’s one way to handle it. Has that been helping you lately?",
    next: () => "wrapup"
  },
  {
    id: "wrapup",
    question: "Thanks for sharing that. Would you like to keep chatting or take a quick mental wellness check?",
    next: () => null
  }
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
  "heroin", "cocaine", "weed", "marijuana", "ganja", "hash", "ecstasy", "molly",
  "lsd", "acid", "vape", "nicotine", "cannabis", "gabapentin", "etizolam",
  "2-dpmp", "tobacco", "fags", "baccy", "balloons", "nitrous oxide", "fentanyl",
  "acetylfentanyl", "opioid", "opiate", "drugs"
];

function detectDrugMention(message) {
  const lower = message.toLowerCase();
  return drugKeywords.some(drug => lower.includes(drug));
}

function notifyDoctor(userMessage) {
  console.log("🚨 ALERT: Doctor notified about potential drug mention.");
  console.log("User message:", userMessage);

  // If you want to connect to a backend API later:
  // fetch('/api/notifyDoctor', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ message: userMessage, timestamp: Date.now() })
  // });
}

function respondToDrugMention() {
  addMessage("It sounds like you mentioned something related to drugs or substances. 💬", false);
  setTimeout(() => {
    addMessage("If you're struggling, curious, or seeking help, you're not alone. Here are some trusted, confidential resources:", false);
    setTimeout(() => {
      addMessage(
        `📞 SAMHSA Helpline: 1-800-662-4357  
💬 Crisis Text Line: Text **HELLO** to 741741  
🌐 Visit [findtreatment.gov](https://findtreatment.gov) for free local help.`,
        false
      );
    }, 1000);
  }, 700);
}

// =========================
// CHAT HANDLERS
// =========================
let currentQuestionId = "icebreaker1";
let inWellnessMode = false;
let currentWellnessSection = 0;
let currentWellnessIndex = 0;
const wellnessAnswers = [];

function addMessage(text, isUser = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;

  const bubbleDiv = document.createElement('div');
  bubbleDiv.className = 'message-bubble';

  const p = document.createElement('p');
  p.innerHTML = text; // allow links
  bubbleDiv.appendChild(p);
  messageDiv.appendChild(bubbleDiv);
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// =========================
// MAIN SEND FUNCTION
// =========================
function sendMessage() {
  const message = chatInput.value.trim();
  if (!message) return;

  addMessage(message, true);
  chatInput.value = '';

  // Check for drug mention
  if (detectDrugMention(message)) {
    respondToDrugMention();
    notifyDoctor(message);
    return;
  }

  if (inWellnessMode) {
    handleWellnessResponse(message);
    return;
  }

  const currentQuestion = conversationFlow.find(q => q.id === currentQuestionId);
  let nextQuestionId = currentQuestion?.next ? currentQuestion.next(message) : null;

  if (currentQuestionId === "wrapup") {
    if (message.toLowerCase().includes("yes") || message.toLowerCase().includes("check")) {
      inWellnessMode = true;
      setTimeout(() => {
        addMessage("Alright 💬 Let’s start your quick wellness check. Please answer each with 'Yes' or 'No'.", false);
        setTimeout(() => askNextWellnessQuestion(), 1200);
      }, 800);
      return;
    } else {
      setTimeout(() => addMessage("No worries 💛 I’m always here if you just want to talk.", false), 800);
      return;
    }
  }

  if (nextQuestionId) {
    currentQuestionId = nextQuestionId;
    const nextQuestion = conversationFlow.find(q => q.id === currentQuestionId);
    setTimeout(() => addMessage(nextQuestion.question, false), 800);
  } else {
    setTimeout(() => addMessage("Thanks for opening up 💬. I’ll pass this info to my analysis system to understand your well-being.", false), 800);
  }
}

// =========================
// WELLNESS CHECK LOGIC
// =========================
function askNextWellnessQuestion() {
  const section = wellnessQuestions[currentWellnessSection];
  if (!section) {
    addMessage("That’s all for now 💭 Thank you for taking this check. Reflecting on these can really help.", false);
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
        addMessage(`Let's talk about ${wellnessQuestions[currentWellnessSection].section} next.`, false);
        setTimeout(() => askNextWellnessQuestion(), 1000);
      }, 800);
    } else {
      addMessage("That was the last section ✅. Thank you for being honest — your responses can help identify possible stress or habit patterns.", false);
      inWellnessMode = false;
    }
  } else {
    setTimeout(() => askNextWellnessQuestion(), 700);
  }
}

// =========================
// EVENT LISTENERS
// =========================
sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

chatInput.addEventListener('input', () => {
  sendBtn.disabled = !chatInput.value.trim();
});

// Initialize
sendBtn.disabled = true;
setTimeout(() => addMessage(conversationFlow.find(q => q.id === "icebreaker1").question, false), 800);