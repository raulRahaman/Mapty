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

class App {
  #map;
  #mapEvent;

  constructor() {
    this._getPosition();
    // Event listeners
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
  }

  // Get current position
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () =>
        alert('Current poisiton unavailable')
      );
  }

  // Load map with current position
  _loadMap(position) {
    // console.log(position);
    const { longitude, latitude } = position.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    const coordinates = [latitude, longitude];
    //Map
    this.#map = L.map('map').setView(coordinates, 15);
    const myIcon = L.icon({ iconUrl: 'icon.png', riseOnHover: true });
    //https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png
    L.tileLayer(
      'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    ).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
  }

  // Show form on map click
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    //Cursor on the distance box (user experience)
    inputDistance.focus();
  }

  // Toggle elevation field
  _toggleElevationField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  //  New workout
  _newWorkout(e) {
    e.preventDefault();

    // Get data from form

    //  Check if data makes sense

    // If workout running, create running object

    // If workout cycling, create cycling object

    // Add new object to workout array

    // Render workout on map as marker

    // Render workout on a list

    // Clear input fields
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';
    //  Display marker and popup
    const { lat, lng } = this.#mapEvent.latlng;
    if (inputType.value === 'cycling') {
      //  Display marker
      L.marker([lat, lng])
        .addTo(this.#map)
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
        .addTo(this.#map)
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
  }
}
////////////////////////////////////////////////////////////////////////
//  Parent class
class Workout {
  constructor(coordinates, distance, duration) {
    this.date = Date.now();
    this.id = this.date.toString().slice(-10);
    this.coordinates = coordinates; // [lat, lng]
    this.distance = distance; // in miles
    this.duration = duration; // in mins
  }
}
// Child class
class Running extends Workout {
  constructor(coordinates, distance, duration, cadence) {
    super(coordinates, distance, duration);
    this.cadence = cadence; // steps per minute
    this.getPace(); // mins per miles
  }

  getPace() {
    this.pace = this.duration / this.distance;
  }
}
// Child class
class Cycling extends Workout {
  constructor(coordinates, distance, duration, elevationGain) {
    super(coordinates, distance, duration);
    this.elevationGain = elevationGain;
    this.getSpeed(); // mph
  }

  getSpeed() {
    this.speed = this.distance / (this.duration / 60);
  }
}

// Class instances
const app = new App();

const run1 = new Running([2, -13], 5, 20, 23);
const cycling1 = new Cycling([2, -13], 50, 10, 502);

console.log(run1);
console.log(cycling1);
