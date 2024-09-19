const express = require('express');
const Groq = require('groq-sdk');
const router = express.Router();

// Use environment variable for API key
const client = new Groq({ apiKey: process.env.GROQ_API_KEY }); // Fetch API key from environment variable

router.get('/aiInteraction', async (req, res) => {
  const building = req.query.building;

  try {
    const chatCompletion = await getGroqChatCompletion(building);
    res.json({ message: chatCompletion.choices[0]?.message?.content || "No response from AI." });
  } catch (error) {
    console.error('Error fetching AI response:', error.message);
    res.status(500).json({ message: 'AI interaction failed', error: error.message });
  }
});

async function getGroqChatCompletion(building) {
  return client.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `You are a greeter in a ${building}. Introduce yourself and offer help.`,
      },
    ],
    model: "llama3-8b-8192",
  });
}

module.exports = router;
