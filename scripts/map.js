function showMap() {
  // Defines basic mapbox data
  mapboxgl.accessToken = 'pk.eyJ1IjoiYWRhbWNoZW4zIiwiYSI6ImNsMGZyNWRtZzB2angzanBjcHVkNTQ2YncifQ.fTdfEXaQ70WoIFLZ2QaRmQ';
  const map = new mapboxgl.Map({
    container: 'map', // Container ID
    style: 'mapbox://styles/mapbox/streets-v11', // Styling URL
    center: [-122.964274, 49.236082], // Starting position
    zoom: 8 // Starting zoom
  });

  // Create a function to add markers to the map 
  function addParkMarker(park) {
    const pupsPlaying = park.pupsPlaying || [];

    // Map each dog ID to a promise that fetches the dog's data
    const dogPromises = pupsPlaying.map(dogProfileId => {
      return db.collection('dog-profiles').doc(dogProfileId).get();
    });

    // Fetch all dog data asynchronously
    Promise.all(dogPromises).then(dogSnapshots => {
      const dogDataArray = dogSnapshots.map(dogProfileDoc => dogProfileDoc.data());

      // Create HTML content for the Popup, including dog information
      const popupContent = `
        <h4>${park.name}</h4>
        <p>${park.details.substring(0, 150)}...</p>
        <a href="eachPark.html?docID=${park.code}" class="popup-readmore">Read More</a>
        <br>
  
        <h6>Pups playing:</h6>
        <ul class="pups-playing-list">
          ${dogDataArray.map(dogData => `<li><img class="pups-playing-img" src="${dogData.ppimgUrl}" alt="Dog Image"> ${dogData.name}</li>`).join('')}
        </ul>
      `;

      // Create a marker element with the number of dogs on each park marker
      const markerElement = document.createElement('div');
      markerElement.className = 'dog-marker';
      markerElement.innerHTML = `<p class="dog-count">${pupsPlaying.length}</p>`;


      // Here can change the color and scale of the marker 
      const marker = new mapboxgl.Marker({
        color: '#9c3b00',
        scale: 0.7
      })
        .setLngLat([park.lng, park.lat])
        .setPopup(new mapboxgl.Popup().setHTML(popupContent))
        .addTo(map);

      // Add pups amount number on the marker in the map
        marker.getElement().appendChild(markerElement);
    });
  }

  // Get the park data from Firebase
  const parksRef = db.collection("parks");
  parksRef.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const parkData = doc.data();
      addParkMarker(parkData);
    });
  });


  // Adds map features
  map.on('load', () => {

    // Add Mapbox Geocoder control
    map.addControl(
      new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
      })
    );

    // Add user controls to map
    map.addControl(new mapboxgl.NavigationControl());

    // Add geolocate control to the map
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        // When active the map will receive updates to the device's location as it changes
        trackUserLocation: true,
        // Draw an arrow next to the location dot to indicate which direction the device is heading
        showUserHeading: true
      })
    )

    // Defines map pin icon for events
    map.loadImage(
      'https://cdn-icons-png.flaticon.com/128/3564/3564555.png',
      (error, image) => {
        if (error) throw error;

        // Add the image to the map style.
        map.addImage('eventpin', image); // Pin Icon

        // READING information from "events" collection in Firestore
        db.collection('parks').get().then(allEvents => {
          const features = []; // Defines an empty array for information to be added to

          allEvents.forEach(doc => {
            lat = doc.data().lat;
            lng = doc.data().lng;
            console.log(lat, lng);
            coordinates = [lng, lat];
            console.log(coordinates);
            // Coordinates
            event_name = doc.data().name; // Event Name
            preview = doc.data().details; // Text Preview
            // img = doc.data().posterurl; // Image
            img = doc.data().pupsPlaying;
            // url = doc.data().link; // URL

            // Pushes information into the features array
            features.push({
              'type': 'Feature',
              'properties': {
                'description': `<strong>${event_name}</strong><p>${preview}</p> <br> <a href="/park.html?id=${doc.id}" target="_blank" title="Opens in a new window">Read more</a>`
              },
              'geometry': {
                'type': 'Point',
                'coordinates': coordinates
              }
            });
          });

          // // Adds features as a source to the map
          // map.addSource('places', {
          //   'type': 'geojson',
          //   'data': {
          //     'type': 'FeatureCollection',
          //     'features': features
          //   }
          // });

          // Creates a layer above the map displaying the pins
          map.addLayer({
            'id': 'places',
            'type': 'symbol',
            // source: 'places',
            'source': 'places',
            'layout': {
              'icon-image': 'eventpin', // Pin Icon
              'icon-size': 0.30, // Pin Size
              'icon-allow-overlap': true // Allows icons to overlap
            }
          });

          // Map On Click function that creates a popup, displaying previously defined information from "events" collection in Firestore
          map.on('click', 'places', (e) => {
            // Copy coordinates array.
            const coordinates = e.features[0].geometry.coordinates.slice();
            const description = e.features[0].properties.description;

            // Ensure that if the map is zoomed out such that multiple copies of the feature are visible, the popup appears over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new mapboxgl.Popup()
              .setLngLat(coordinates)
              .setHTML(description)
              .addTo(map);
          });

          // Change the cursor to a pointer when the mouse is over the places layer.
          map.on('mouseenter', 'places', () => {
            map.getCanvas().style.cursor = 'pointer';
          });

          // Defaults cursor when not hovering over the places layer
          map.on('mouseleave', 'places', () => {
            map.getCanvas().style.cursor = '';
          });
        });
      }
    );

    // Add the image to the map style.
    map.loadImage(
      'https://cdn-icons-png.flaticon.com/128/1643/1643664.png',
      (error, image) => {
        if (error) throw error;

        // Add the image to the map style with width and height values
        map.addImage('userpin', image, { width: 10, height: 10 });

        // Adds user's current location as a source to the map
        navigator.geolocation.getCurrentPosition(position => {
          const userLocation = [position.coords.longitude, position.coords.latitude];
          console.log(userLocation);
          if (userLocation) {
            map.addSource('userLocation', {
              'type': 'geojson',
              'data': {
                'type': 'FeatureCollection',
                'features': [{
                  'type': 'Feature',
                  'geometry': {
                    'type': 'Point',
                    'coordinates': userLocation
                  },
                  'properties': {
                    'description': 'Your location'
                  }
                }]
              }
            });

            // Creates a layer above the map displaying the user's location
            map.addLayer({
              'id': 'userLocation',
              'type': 'symbol',
              'source': 'userLocation',
              'layout': {
                'icon-image': 'userpin', // Pin Icon
                'icon-size': 0.22, // Pin Size
                'icon-allow-overlap': true // Allows icons to overlap
              }
            });

            // Map On Click function that creates a popup displaying the user's location
            map.on('click', 'userLocation', (e) => {
              // Copy coordinates array.
              const coordinates = e.features[0].geometry.coordinates.slice();
              const description = e.features[0].properties.description;

              new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(description)
                .addTo(map);
            });

            // Change the cursor to a pointer when the mouse is over the userLocation layer.
            map.on('mouseenter', 'userLocation', () => {
              map.getCanvas().style.cursor = 'pointer';
            });

            // Defaults
            // Defaults cursor when not hovering over the userLocation layer
            map.on('mouseleave', 'userLocation', () => {
              map.getCanvas().style.cursor = '';
            });
          }
        });
      }
    );
  });
};

// Call the function to display the map with the user's location and event pins
showMap();

