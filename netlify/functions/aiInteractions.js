const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const characters = {
  "Hospital": [
    { name: "Dr. Emily", jobTitle: "Surgeon", backstory: "A compassionate surgeon with 15 years of experience." },
    { name: "Nurse Jack", jobTitle: "Nurse", backstory: "An energetic nurse known for his humor and efficiency." }
  ],
  "Gym": [
    { name: "Coach Sarah", jobTitle: "Personal Trainer", backstory: "A former Olympic athlete turned personal trainer." },
    { name: "Zen Master Yuki", jobTitle: "Yoga Instructor", backstory: "A calm and patient yoga instructor." }
  ],
  "Restaurant": [
    { name: "Chef Marco", jobTitle: "Head Chef", backstory: "An innovative chef with a passion for vegan fusion cuisine." },
    { name: "Sommelier Olivia", jobTitle: "Health Food Expert", backstory: "A healthy food expert with an encyclopedic knowledge of health benefits that food can provide." }
  ]
};

let conversationHistory = {};

exports.handler = async (event, context) => {
  const building = event.queryStringParameters.building;
  const message = event.queryStringParameters.message;
  const character = event.queryStringParameters.character;
  const isFirstMessage = event.queryStringParameters.isFirstMessage === 'true';

  try {
    const chatCompletion = await getGroqChatCompletion(building, character, message, isFirstMessage);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: chatCompletion.choices[0]?.message?.content || "No response from AI." }),
    };
  } catch (error) {
    console.error('Error fetching AI response:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'AI interaction failed', error: error.message }),
    };
  }
};

async function getGroqChatCompletion(building, character, message, isFirstMessage) {
  const buildingNames = {
    "Hospital": "Steven's Hospital",
    "Gym": "Steven's Gym",
    "Restaurant": "Steven's Vegan Restaurant",
  };

  const buildingName = buildingNames[building] || building;
  const characterInfo = characters[building].find(c => c.name === character);

  if (!conversationHistory[character]) {
    conversationHistory[character] = [];
  }

  const systemMessage = isFirstMessage
    ? `You are ${character}, ${characterInfo.backstory} You work at ${buildingName}. Introduce yourself and offer help. Always use the full name "${buildingName}" when referring to this place.`
    : `You are ${character}, ${characterInfo.backstory} You work at ${buildingName}. Always use the full name "${buildingName}" when referring to this place.`;

  conversationHistory[character].push({ role: "user", content: message });

  const response = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemMessage },
      ...conversationHistory[character],
    ],
    model: "llama3-8b-8192",
  });

  conversationHistory[character].push({ role: "assistant", content: response.choices[0]?.message?.content });

  return response;
}