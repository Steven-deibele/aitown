const buildings = document.querySelectorAll('.building');

buildings.forEach(building => {
  building.addEventListener('click', () => {
    const buildingName = building.getAttribute('data-building');
    window.location.href = `building.html?building=${buildingName}`;
  });
});
