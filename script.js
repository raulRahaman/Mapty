'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

if (navigator.geolocation) 
  navigator.geolocation.getCurrentPosition(function (position) {
    const { longitude, latitude } = position.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    const coordinates = [latitude, longitude];

    //Map
    const map = L.map('map').setView(coordinates, 15);
    const myIcon = L.icon({ iconUrl: 'icon.png' });

    //https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png
    L.tileLayer(
      'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    ).addTo(map);

    map
      .on('click', function (mapE) {
        const { lat, lng } = mapE.latlng;

        L.marker([lat, lng], { riseOnHover: true, icon: myIcon });
      })
      .addTo(map)
      .bindPopup('Current location.')
      .openPopup();
  });

  L.marker(coordinates)
    .addTo(map)
    .bindPopup('Current location.<br> Easily customizable.')
    .openPopup();
},
() => alert('Current poisiton unavailable')
);
