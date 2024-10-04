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
let conversationHistory = {};

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
    displayCharacterSelection(characters[building]);
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
  
  const switchCharacterButton = document.createElement('button');
  switchCharacterButton.textContent = 'Switch Character';
  switchCharacterButton.addEventListener('click', () => {
    characterSelection.style.display = 'block';
    messagesContainer.style.display = 'none';
    userInput.style.display = 'none';
    sendButton.style.display = 'none';
    switchCharacterButton.remove();
  });
  
  document.getElementById('chatContainer').appendChild(switchCharacterButton);
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

    // Update conversation history
    if (!conversationHistory[selectedCharacter.name]) {
      conversationHistory[selectedCharacter.name] = [];
    }
    conversationHistory[selectedCharacter.name].push({ role: "user", content: userMessage });
    conversationHistory[selectedCharacter.name].push({ role: "assistant", content: data.message });

  } catch (error) {
    console.error('Error interacting with AI:', error);
    addMessage('System', 'Sorry, something went wrong. Please try again later.');
  }
}

function addMessage(sender, message) {
  if (sender !== 'User') {
    messagesContainer.innerHTML = '';
  }
  const messageElement = document.createElement('div');
  messageElement.textContent = `${sender}: ${message}`;
  messagesContainer.appendChild(messageElement);
}

function closeChat() {
  window.close();
}

function saveConversation() {
  if (!selectedCharacter || !conversationHistory[selectedCharacter.name] || conversationHistory[selectedCharacter.name].length === 0) {
    alert('No conversation to save.');
    return;
  }
  const conversation = JSON.stringify(conversationHistory[selectedCharacter.name]);
  const blob = new Blob([conversation], { type: 'text/plain' });
  
  const fileName = prompt('Enter a name for your conversation file:', 'conversation.txt');
  if (fileName) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

function loadConversation() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.txt';
  input.onchange = function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const loadedConversation = JSON.parse(e.target.result);
        if (Array.isArray(loadedConversation) && loadedConversation.length > 0) {
          const loadedCharacter = loadedConversation[0].role === 'assistant' ? loadedConversation[0].content.split(':')[0] : null;
          if (loadedCharacter && loadedCharacter === selectedCharacter.name) {
            conversationHistory[selectedCharacter.name] = loadedConversation;
            messagesContainer.innerHTML = '';
            loadedConversation.forEach(message => {
              if (message.role !== 'system') {
                addMessage(message.role === 'assistant' ? selectedCharacter.name : 'User', message.content);
              }
            });
            alert('Conversation loaded successfully.');
          } else {
            alert('This conversation file is not for the current character or building.');
          }
        } else {
          alert('Invalid conversation file.');
        }
      } catch (error) {
        console.error('Error loading conversation:', error);
        alert('Error loading conversation. Please try again.');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

document.getElementById('saveButton').addEventListener('click', saveConversation);
document.getElementById('loadButton').addEventListener('click', loadConversation);
document.getElementById('switchCharacterButton').addEventListener('click', () => {
  characterSelection.style.display = 'block';
  messagesContainer.style.display = 'none';
  userInput.style.display = 'none';
  sendButton.style.display = 'none';
});