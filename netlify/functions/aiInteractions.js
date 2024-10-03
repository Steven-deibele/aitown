const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.handler = async (event, context) => {
  const building = event.queryStringParameters.building;
  const message = event.queryStringParameters.message;

  try {
    const chatCompletion = await getGroqChatCompletion(building, message);
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

async function getGroqChatCompletion(building, message) {
  const buildingNames = {
    "Hospital": "Steven's Hospital",
    "Gym": "Steven's Gym",
    "Restaurant": "Steven's Vegan Restaurant",
    // Add more buildings and their specific names here
  };

  const buildingName = buildingNames[building] || building;

  return groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a greeter in ${buildingName}. Introduce yourself and offer help. Always use the full name "${buildingName}" when referring to this place.`,
      },
      {
        role: "user",
        content: message,
      },
    ],
    model: "llama3-8b-8192",
  });
}
