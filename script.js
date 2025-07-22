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
let map, mapEvent;

if (navigator.geolocation)
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const { longitude, latitude } = position.coords;
      console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

      const coordinates = [latitude, longitude];

      //Map
      map = L.map('map').setView(coordinates, 15);
      const myIcon = L.icon({ iconUrl: 'icon.png', riseOnHover: true });

      //https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png
      L.tileLayer(
        'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }
      ).addTo(map);

      map.on('click', function (mapE) {
        mapEvent = mapE;

        form.classList.remove('hidden');
        //Cursor on the distance box (user experience)
        inputDistance.focus();
      });
    },
    () => alert('Current poisiton unavailable')
  );

form.addEventListener('submit', (e) => {
  e.preventDefault();

  // Clear fields
  inputCadence.value =
    inputDistance.value =
    inputDuration.value =
    inputElevation.value =
      '';

  const { lat, lng } = mapEvent.latlng;
  //  Display marker
  if (inputType.value === 'cycling') {
    //  Display marker
    L.marker([lat, lng])
      .addTo(map)
      .bindPopup(
        L.popup({
          maxHeight: 100,
          autoClose: false,
          closeOnClick: false,
          riseOnHover: true,
          content: 'Cycling🚴🏽‍♂️',
          className: 'cycling-popup',
        })
      )
      .openPopup();
  } else if (inputType.value === 'running') {
    L.marker([lat, lng])
      .addTo(map)
      .bindPopup(
        L.popup({
          maxHeight: 100,
          autoClose: false,
          closeOnClick: false,
          riseOnHover: true,
          content: 'Run🏃🏽',
          className: 'running-popup',
        })
      )
      .openPopup();
  }
});

inputType.addEventListener('change', () => {
  //Adding elevation for cycling
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
});
