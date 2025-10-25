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
const alertKeywords = [
  "heroin","cocaine","weed","marijuana","ganja","hash","ecstasy","molly","lsd","acid",
  "vape","nicotine","cannabis","gabapentin","etizolam","2-dpmp","tobacco","fags","baccy",
  "balloons","nitrous oxide","fentanyl","acetylfentanyl","opioid","opiate","drugs","suicide","self harm"
];
function detectAlert(message){
  const lower = message.toLowerCase();
  return alertKeywords.some(word => lower.includes(word));
}
function alertProfessional(message){
  addMessage("⚠️ It seems you mentioned something serious regarding drugs or self-harm. Please consider contacting a professional immediately.", false);
  addMessage(`📞 SAMHSA Helpline: 1-800-662-4357
💬 Crisis Text Line: Text HELLO to 741741
🌐 Visit [findtreatment.gov](https://findtreatment.gov)`, false);
  console.log("ALERT TRIGGERED:", message);
}

// =========================
// ICEBREAKERS
// =========================
const icebreakers = [
  "Hello! I'm here to listen and support you. How are you feeling today?",
  "Before we start, what's your favorite food?",
  "Nice! What's your favorite color?",
  "What's your favorite hobby?",
  "Do you have a favorite movie or show?"
];

// =========================
// MAIN WELLNESS QUESTIONS
// =========================
const wellnessQuestions = [
  { key: "Experimentation", question: "Have you experimented with substances or addictive habits? (Yes/No)" },
  { key: "Academic_Performance_Decline", question: "Have you noticed a decline in your academic or work performance? (Yes/No)" },
  { key: "Social_Isolation", question: "Have you withdrawn from social activities or friends recently? (Yes/No)" },
  { key: "Financial_Issues", question: "Have you experienced financial problems due to your habits? (Yes/No)" },
  { key: "Physical_Mental_Health_Problems", question: "Have you noticed physical or mental health problems from your habit? (Yes/No)" },
  { key: "Legal_Consequences", question: "Have you faced legal trouble because of your habit? (Yes/No)" },
  { key: "Relationship_Strain", question: "Have your relationships been strained due to your habit? (Yes/No)" },
  { key: "Risk_Taking_Behavior", question: "Have you engaged in risky behaviors due to your habit? (Yes/No)" },
  { key: "Withdrawal_Symptoms", question: "Do you experience withdrawal symptoms when you stop? (Yes/No)" },
  { key: "Denial_and_Resistance_to_Treatment", question: "Do you resist acknowledging the problem or treatment? (Yes/No)" }
];

const concernLabels = {
  "Experimentation": "Experimentation / Substance Use",
  "Academic_Performance_Decline": "Academic Performance",
  "Social_Isolation": "Social Withdrawal",
  "Financial_Issues": "Financial Problems",
  "Physical_Mental_Health_Problems": "Physical / Mental Health",
  "Legal_Consequences": "Legal Issues",
  "Relationship_Strain": "Relationship Strain",
  "Risk_Taking_Behavior": "Risky Behavior",
  "Withdrawal_Symptoms": "Withdrawal Symptoms",
  "Denial_and_Resistance_to_Treatment": "Resistance to Treatment"
};

// =========================
// CHAT STATE
// =========================
let icebreakerIndex = 0;
let mainQuestionIndex = 0;
let inTellMeMore = false;
let wellnessAnswers = [];
let finishedMainQuestions = false;

// =========================
// ADD CHAT MESSAGE
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
function sendMessage(){
  const msg = chatInput.value.trim();
  if(!msg) return;
  addMessage(msg, true);
  chatInput.value = '';

  if(detectAlert(msg)){
    alertProfessional(msg);
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

  if(inTellMeMore){
    addMessage("Thanks for sharing that.", false);
    inTellMeMore = false;
    mainQuestionIndex++;
    askNextMainQuestion();
    return;
  }

  if(!finishedMainQuestions && mainQuestionIndex < wellnessQuestions.length){
    const answer = msg.toLowerCase().includes("yes") ? 1 : 0;
    wellnessAnswers.push(answer);
    if(answer === 1){
      addMessage("Tell me more about that...", false);
      inTellMeMore = true;
    } else {
      addMessage("Thanks for sharing that.", false);
      mainQuestionIndex++;
      askNextMainQuestion();
    }
    return;
  }

  // Comforting generic responses
  const comfortingResponses = [
    "I hear you.",
    "That’s totally normal.",
    "Thanks for sharing, I’m here for you.",
    "It’s okay, take your time.",
    "I understand, many people feel that way."
  ];
  const resp = comfortingResponses[Math.floor(Math.random()*comfortingResponses.length)];
  addMessage(resp, false);
}

// =========================
// ASK NEXT MAIN QUESTION
// =========================
function askNextMainQuestion(){
  if(mainQuestionIndex < wellnessQuestions.length){
    setTimeout(()=> addMessage(wellnessQuestions[mainQuestionIndex].question, false), 700);
  } else {
    finishedMainQuestions = true;
    setTimeout(analyzeWellnessResponses, 1000);
  }
}

// =========================
// GENERATE PERSONALIZED FEEDBACK
// =========================
function generatePersonalizedFeedback(addictionPercent, addictionClass, symptoms){
  let feedback = `Your score indicates ${addictionClass} (${addictionPercent.toFixed(1)}%). `;

  if(symptoms.length > 0){
    feedback += "Based on your answers, some areas to focus on are: ";
    feedback += symptoms.join(", ") + ". ";
  }

  if(addictionPercent <= 25){
    feedback += "You appear to have low risk. Maintaining healthy routines and self-care is recommended.";
  } else if(addictionPercent <= 50){
    feedback += "You have a moderate risk. Consider mindfulness, journaling, and talking with trusted friends or a counselor.";
  } else if(addictionPercent <= 75){
    feedback += "You have a high risk. It is recommended to seek structured support programs or therapy and monitor triggers closely.";
  } else {
    feedback += "Your risk is very high. Please consider immediate professional help, contact hotlines, or rehabilitation services.";
  }

  return feedback;
}

// =========================
// ANALYZE WELLNESS RESPONSES
// =========================
async function analyzeWellnessResponses(){
  try{
    addMessage("Analyzing your responses...", false);

    const response = await fetch("http://127.0.0.1:5000/analyze", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({responses: wellnessAnswers})
    });

    const data = await response.json();

    const symptoms = wellnessQuestions
      .filter((q,i)=> wellnessAnswers[i] === 1)
      .map(q=> concernLabels[q.key] || q.key);

    const personalizedFeedback = generatePersonalizedFeedback(
      data.addiction_percent,
      data.predicted_class,
      symptoms
    );

    addMessage(personalizedFeedback, false);

    // Optional: store results in backend
    await fetch("http://127.0.0.1:5000/store_results", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        addiction_percent: data.addiction_percent,
        predicted_class: data.predicted_class,
        symptoms: symptoms
      })
    });

  } catch(err){
    console.error("Error analyzing responses:", err);
    addMessage("⚠️ Failed to analyze responses. Please try again.", false);
  }
}

// =========================
// EVENT LISTENERS
// =========================
sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', e=>{if(e.key==='Enter') sendMessage();});
chatInput.addEventListener('input', ()=>{sendBtn.disabled = !chatInput.value.trim();});
sendBtn.disabled = chatInput.value.trim() === '';

// =========================
// INITIALIZE CHAT
// =========================
setTimeout(()=> addMessage(icebreakers[0], false), 800);
