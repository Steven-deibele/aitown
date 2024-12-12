function saveApiKey() {
  const apiKey = document.getElementById('groqApiKey').value;
  if (apiKey) {
    localStorage.setItem('groqApiKey', apiKey);
    document.getElementById('apiKeyStatus').textContent = 'API Key saved!';
    setTimeout(() => {
      document.getElementById('apiKeyStatus').textContent = '';
    }, 2000);
  } else {
    document.getElementById('apiKeyStatus').textContent = 'Please enter an API key';
  }
}

// Check if API key exists on page load
window.addEventListener('DOMContentLoaded', () => {
  const buildings = document.querySelectorAll('.building');
  
  buildings.forEach(building => {
    building.addEventListener('click', (e) => {
      if (!localStorage.getItem('groqApiKey')) {
        e.preventDefault();
        alert('Please enter your Groq API key first');
        document.getElementById('groqApiKey').focus();
        return;
      }
      const buildingName = building.getAttribute('data-building');
      window.location.href = `building.html?building=${buildingName}`;
    });
  });
});
