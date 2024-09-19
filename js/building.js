const urlParams = new URLSearchParams(window.location.search);
const buildingName = urlParams.get('building');
const buildingTitle = document.getElementById('buildingTitle');
const interactionText = document.getElementById('interactionText');
const messagesContainer = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

if (buildingName) {
  buildingTitle.textContent = buildingName;

  // Set background based on building
  const imageUrl = `images/${buildingName.toLowerCase()}.avif`; // Ensure the correct extension
  const img = new Image();
  img.src = imageUrl;
  img.onload = () => {
    document.body.style.backgroundImage = `url('${imageUrl}')`;
  };
  img.onerror = () => {
    document.body.style.backgroundColor = '#f0f0f0'; // Fallback color if image fails to load
  };

  // Simulated interaction
  interactionText.textContent = `Welcome to the ${buildingName}! How can we assist you?`;

  // Event listener for sending messages
  sendButton.addEventListener('click', () => {
    const userMessage = userInput.value;
    if (userMessage) {
      addMessage('User', userMessage);
      aiInteraction(userMessage);
      userInput.value = ''; // Clear input field
    }
  });
} else {
  interactionText.textContent = 'Building not found.';
}

async function aiInteraction(userMessage) {
  try {
    const response = await fetch(`/api/aiInteraction?building=${buildingName}`);
    if (!response.ok) {
      const errorText = await response.text(); // Get the error response text
      throw new Error(`Network response was not ok: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    addMessage('AI', data.message);

    // Change background image based on building
    const buildingImageUrl = `images/${building.toLowerCase()}.jpg`; // Adjust the image path as needed
    document.body.style.backgroundImage = `url('${buildingImageUrl}')`;
  } catch (error) {
    console.error('Error interacting with AI:', error);
    addMessage('AI', 'Sorry, something went wrong. Please try again later.');
  }
}

function addMessage(sender, message) {
  const messageElement = document.createElement('div');
  messageElement.textContent = `${sender}: ${message}`;
  messagesContainer.appendChild(messageElement);
}

function closeChat() {
  window.close(); // Close the current window
}
