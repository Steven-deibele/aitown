const Groq = require('groq-sdk');

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

  const groq = new Groq({ apiKey: apiKey });

  try {
    const chatCompletion = await getGroqChatCompletion(groq, building, character, message, isFirstMessage);
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

async function getGroqChatCompletion(groq, building, character, message, isFirstMessage) {
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
    model: "llama-3.2-11b-vision-preview",
  });

  conversationHistory[character].push({ role: "assistant", content: response.choices[0]?.message?.content });

  return response;
}