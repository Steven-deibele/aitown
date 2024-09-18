const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.handler = async (event, context) => {
  const building = event.queryStringParameters.building;

  try {
    const chatCompletion = await getGroqChatCompletion(building);
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

async function getGroqChatCompletion(building) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `You are a greeter in a ${building}. Introduce yourself and offer help.`,
      },
    ],
    model: "llama3-8b-8192",
  });
}
