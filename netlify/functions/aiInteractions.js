const Groq = require('groq-sdk');

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
  ],
  "Steve's Automotive Shop": [
    { name: "Steve", jobTitle: "Head Mechanic", backstory: "A skilled mechanic with 30 years of experience in all types of vehicles." },
    { name: "Lisa", jobTitle: "Car Buying Expert", backstory: "A former car salesperson who now helps customers make informed decisions when buying cars." }
  ],
  "Steve's Law Office": [
    { name: "John Doe", jobTitle: "General Law Attorney", backstory: "A versatile lawyer with experience in various areas of law." },
    { name: "Jane Smith", jobTitle: "Traffic Law Specialist", backstory: "An expert in traffic law with a high success rate in defending clients." }
  ]
};

// Initialize conversation history object
let conversationHistory = {};

exports.handler = async (event, context) => {
  const building = event.queryStringParameters.building;
  const message = event.queryStringParameters.message;
  const character = event.queryStringParameters.character;
  const isFirstMessage = event.queryStringParameters.isFirstMessage === 'true';
  const apiKey = event.queryStringParameters.apiKey;

  if (!apiKey) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'API key is required' }),
    };
  }

  if (!characters[building]) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid building selected' }),
    };
  }

  const characterInfo = characters[building].find(c => c.name === character);
  if (!characterInfo) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid character selected' }),
    };
  }

  const groq = new Groq({ apiKey: apiKey });

  try {
    const chatCompletion = await getGroqChatCompletion(groq, building, characterInfo, message, isFirstMessage);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: chatCompletion.choices[0]?.message?.content || "No response from AI." }),
    };
  } catch (error) {
    console.error('Error fetching AI response:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'AI interaction failed', error: error.toString() }),
    };
  }
};

async function getGroqChatCompletion(groq, building, characterInfo, message, isFirstMessage) {
  const buildingNames = {
    "Hospital": "Steven's Hospital",
    "Gym": "Steven's Gym",
    "Restaurant": "Steven's Vegan Restaurant",
    "Steve's Automotive Shop": "Steve's Automotive Shop",
    "Steve's Law Office": "Steve's Law Office"
  };

  const buildingName = buildingNames[building] || building;

  if (!conversationHistory[characterInfo.name]) {
    conversationHistory[characterInfo.name] = [];
  }

  const systemMessage = isFirstMessage
    ? `You are ${characterInfo.name}, ${characterInfo.backstory} You work at ${buildingName}. Introduce yourself and offer help. Always use the full name "${buildingName}" when referring to this place.`
    : `You are ${characterInfo.name}, ${characterInfo.backstory} You work at ${buildingName}. Always use the full name "${buildingName}" when referring to this place.`;

  conversationHistory[characterInfo.name].push({ role: "user", content: message });

  const response = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemMessage },
      ...conversationHistory[characterInfo.name],
    ],
    model: "llama-3.1-8b-instant",
    temperature: 0.7,
    max_tokens: 1024,
  });

  conversationHistory[characterInfo.name].push({ role: "assistant", content: response.choices[0]?.message?.content });

  return response;
}