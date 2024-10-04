const urlParams = new URLSearchParams(window.location.search);
const buildingName = urlParams.get('building');
const buildingTitle = document.getElementById('buildingTitle');
const interactionText = document.getElementById('interactionText');
const messagesContainer = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const characterSelection = document.getElementById('characterSelection');

let isFirstMessage = true;
let selectedCharacter = null;

if (buildingName) {
  buildingTitle.textContent = buildingName;

  const imageUrl = `/images/${buildingName.toLowerCase()}.avif`;
  const img = new Image();
  img.src = imageUrl;
  img.onload = () => {
    document.body.style.backgroundImage = `url('${imageUrl}')`;
  };
  img.onerror = () => {
    document.body.style.backgroundColor = '#f0f0f0';
  };

  interactionText.textContent = `Welcome to the ${buildingName}! Please select a character to interact with:`;

  fetchCharacters(buildingName);

  sendButton.addEventListener('click', sendMessage);
  userInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      sendMessage();
    }
  });
} else {
  interactionText.textContent = 'Building not found.';
}

async function fetchCharacters(building) {
  try {
    const response = await fetch(`/.netlify/functions/getCharacters?building=${building}`);
    const characters = await response.json();
    displayCharacterSelection(characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
  }
}

function displayCharacterSelection(characters) {
  const form = document.createElement('form');
  characters.forEach(character => {
    const radioDiv = document.createElement('div');
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.id = character.name;
    radio.name = 'character';
    radio.value = character.name;
    
    const label = document.createElement('label');
    label.htmlFor = character.name;
    label.textContent = `${character.name} - ${character.jobTitle}`;
    
    radioDiv.appendChild(radio);
    radioDiv.appendChild(label);
    form.appendChild(radioDiv);
  });
  
  const submitButton = document.createElement('button');
  submitButton.textContent = 'Select Character';
  submitButton.addEventListener('click', (e) => {
    e.preventDefault();
    const selectedCharacter = form.querySelector('input[name="character"]:checked');
    if (selectedCharacter) {
      selectCharacter(characters.find(c => c.name === selectedCharacter.value));
    }
  });
  form.appendChild(submitButton);
  
  characterSelection.appendChild(form);
}

function selectCharacter(character) {
  selectedCharacter = character;
  interactionText.textContent = `You are now talking to ${character.name}. How can they assist you?`;
  characterSelection.style.display = 'none';
  messagesContainer.style.display = 'block';
  userInput.style.display = 'block';
  sendButton.style.display = 'block';
}

async function sendMessage() {
  const userMessage = userInput.value;
  if (userMessage && selectedCharacter) {
    addMessage('User', userMessage);
    await aiInteraction(userMessage);
    userInput.value = '';
  }
}

async function aiInteraction(userMessage) {
  try {
    const response = await fetch(`/.netlify/functions/aiInteractions?building=${buildingName}&character=${selectedCharacter.name}&message=${encodeURIComponent(userMessage)}&isFirstMessage=${isFirstMessage}`);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    const data = await response.json();
    addMessage(selectedCharacter.name, data.message);
    isFirstMessage = false;
  } catch (error) {
    console.error('Error interacting with AI:', error);
    addMessage('System', 'Sorry, something went wrong. Please try again later.');
  }
}

function addMessage(sender, message) {
  const messageElement = document.createElement('div');
  messageElement.textContent = `${sender}: ${message}`;
  messagesContainer.appendChild(messageElement);
}

function closeChat() {
  window.close();
}