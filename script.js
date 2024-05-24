document.getElementById("login-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("name").value;
  localStorage.setItem("name", name);
  document.getElementById("login-section").style.display = "none";
  document.getElementById("report-section").style.display = "block";
  initializeMap();
});

document.getElementById("report-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const issue = document.getElementById("issue").value;
  const description = document.getElementById("description").value;
  const name = localStorage.getItem("name");
  const markerPosition = marker.getLatLng();

  const report = {
    name: name,
    issue: issue,
    description: description,
    location: {
      lat: markerPosition.lat,
      lng: markerPosition.lng,
    },
    date: new Date().toISOString(),
  };

  // Récupérer la photo du formulaire
  const photo = document.getElementById("photo").files[0];
  const reader = new FileReader();
  reader.onloadend = function () {
    const photoData = reader.result;

    // Envoyer l'e-mail via EmailJS avec les informations et la photo
    emailjs
      .send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
        name: report.name,
        issue: report.issue,
        description: report.description,
        latitude: report.location.lat,
        longitude: report.location.lng,
        date: report.date,
        photo: photoData, // Ajouter la photo dans les données envoyées
      })
      .then(
        function (response) {
          console.log("SUCCESS!", response.status, response.text);
        },
        function (error) {
          console.log("FAILED...", error);
        }
      );
  };

  if (photo) {
    reader.readAsDataURL(photo); // Convertir la photo en données base64
  }

  // Afficher un message de succès
  document.getElementById("report-form").reset();
  document.getElementById("success-message").style.display = "block";
  setTimeout(() => {
    document.getElementById("success-message").style.display = "none";
  }, 3000);
});

let map;
let marker;

function initializeMap() {
  // Coordonnées de la rue Jules Empain, Manage, Belgique
  const rueJulesEmpainCoords = [50.49931660708205, 4.227097573260332]; // Coordonnées centrales de la rue
  const rueJulesEmpainBounds = [
    [50.49999303172839, 4.233402891559012], // Sud-Ouest approximatif
    [50.49809413360389, 4.219679034852993], // Nord-Est approximatif
  ];

  map = L.map("map").setView(rueJulesEmpainCoords, 24); // Augmenter le niveau de zoom à 24

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  map.on("click", function (e) {
    if (marker) {
      marker.setLatLng(e.latlng);
    } else {
      marker = L.marker(e.latlng).addTo(map);
    }
  });

  // Définir les limites de la carte
  map.setMaxBounds(rueJulesEmpainBounds);

  // Ajouter les numéros de maison au menu déroulant
  const houseNumbers = [
    { number: "1", coords: [50.49953707224509, 4.2307262677484] },
    { number: "3", coords: [50.49948749099372, 4.2306955996934565] },
    { number: "5", coords: [50.4994661645737, 4.230601722375578] },
    { number: "7", coords: [50.499394261526746, 4.230412228750591] },
    { number: "9", coords: [50.4993, 4.2302] },
    { number: "11", coords: [50.4993, 4.23] },
    // Ajouter d'autres numéros de maison et leurs coordonnées ici
  ];

  const houseNumberSelect = document.getElementById("house-number");
  houseNumbers.forEach((house) => {
    const option = document.createElement("option");
    option.value = house.coords.join(",");
    option.textContent = house.number;
    houseNumberSelect.appendChild(option);
  });

  houseNumberSelect.addEventListener("change", function () {
    const selectedCoords = this.value.split(",").map(Number);
    if (selectedCoords.length === 2) {
      map.setView(selectedCoords, 26); // Zoomer sur la maison sélectionnée
      if (marker) {
        marker.setLatLng(selectedCoords);
      } else {
        marker = L.marker(selectedCoords).addTo(map);
      }
    }
  });
}
