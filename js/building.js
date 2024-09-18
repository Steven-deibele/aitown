const urlParams = new URLSearchParams(window.location.search);
const buildingName = urlParams.get('building');
const buildingTitle = document.getElementById('buildingTitle');
const interactionText = document.getElementById('interactionText');

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

  // Optionally, make an API call to get AI-generated text
  aiInteraction(buildingName);
} else {
  interactionText.textContent = 'Building not found.';
}

async function aiInteraction(building) {
  try {
    const response = await fetch(`/.netlify/functions/aiInteraction?building=${building}`);
    if (!response.ok) {
      const errorText = await response.text(); // Get the error response text
      throw new Error(`Network response was not ok: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    interactionText.textContent = data.message;

    // Change background image based on building
    const buildingImageUrl = `images/${building.toLowerCase()}.jpg`; // Adjust the image path as needed
    document.body.style.backgroundImage = `url('${buildingImageUrl}')`;
  } catch (error) {
    console.error('Error interacting with AI:', error);
    interactionText.textContent = 'Sorry, something went wrong. Please try again later.';
  }
}

function closeChat() {
  window.close(); // Close the current window
}
