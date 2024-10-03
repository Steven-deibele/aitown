const urlParams = new URLSearchParams(window.location.search);
const buildingName = urlParams.get('building');
const buildingTitle = document.getElementById('buildingTitle');
const interactionText = document.getElementById('interactionText');
const messagesContainer = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

let isFirstMessage = true;

if (buildingName) {
  buildingTitle.textContent = buildingName;

  // Set background based on building
  const imageUrl = `/images/${buildingName.toLowerCase()}.avif`;
  const img = new Image();
  img.src = imageUrl;
  img.onload = () => {
    document.body.style.backgroundImage = `url('${imageUrl}')`;
  };
  img.onerror = () => {
    document.body.style.backgroundColor = '#f0f0f0';
  };

  interactionText.textContent = `Welcome to the ${buildingName}! How can we assist you?`;

  // Event listener for sending messages
  sendButton.addEventListener('click', sendMessage);
  userInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      sendMessage();
    }
  });
} else {
  interactionText.textContent = 'Building not found.';
}

function sendMessage() {
  const userMessage = userInput.value;
  if (userMessage) {
    addMessage('User', userMessage);
    aiInteraction(userMessage);
    userInput.value = '';
  }
}

async function aiInteraction(userMessage) {
  try {
    const response = await fetch(`/.netlify/functions/aiInteractions?building=${buildingName}&message=${encodeURIComponent(userMessage)}&isFirstMessage=${isFirstMessage}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Network response was not ok: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    addMessage('AI', data.message);
    isFirstMessage = false;
  } catch (error) {
    console.error('Error interacting with AI:', error);
    addMessage('AI', 'Sorry, something went wrong. Please try again later.');
  }
}

function addMessage(sender, message) {
  messagesContainer.innerHTML = ''; // Clear previous messages
  const messageElement = document.createElement('div');
  messageElement.textContent = `${sender}: ${message}`;
  messagesContainer.appendChild(messageElement);
}

function closeChat() {
  window.close();
}

