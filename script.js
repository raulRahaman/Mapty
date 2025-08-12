'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
let workout;

class App {
  #map;
  #mapEvent;
  #mapZoom = 15;
  #workouts = [];

  constructor() {
    // Get user's position
    this._getPosition();

    // Load the saved data right as the page loads
    this._getLocalStorage();

    // Event listeners
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
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
    const { longitude, latitude } = position.coords;
    const coordinates = [latitude, longitude];
    //Map
    this.#map = L.map('map').setView(coordinates, this.#mapZoom);
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
    // Markers need to be loeaded after map is loaded
    // hence why it's called here
    this.#workouts.forEach((work) => this._workoutPopup(work));
  }

  // Show form on map click
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    //Cursor on the distance box (user experience)
    inputDistance.focus();
  }

  // Hide form after adding workout
  _hideForm() {
    form.style.display = 'none';
    form.classList.add('hidden');

    setTimeout(() => {
      form.style.display = 'grid';
    }, 1000);

    // Clear input fields
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';
  }

  // Toggle elevation field
  _toggleElevationField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  //  New workout
  _newWorkout(e) {
    e.preventDefault();

    //Functions to check for any non/negative number (for cleaner code and redability)
    const checkInput = (...inputs) =>
      inputs.every((input) => Number.isFinite(input));
    const checkPositiveNum = (...inputs) => inputs.every((input) => input > 0);
    // function checkInput1(...inputs) {
    //   inputs.every((input) => Number.isFinite(input));
    // }

    // Get data from form
    const typeWorkout = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const cadence = +inputCadence.value;
    const elevation = +inputElevation.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;
    // console.log(typeWorkout, distance, duration);

    // If workout running, create running object
    //  Check if data makes sense
    if (typeWorkout === 'running') {
      if (
        !checkInput(distance, duration, cadence) ||
        !checkPositiveNum(distance, duration, cadence)
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
      )
        return alert('🔴Numbers have to be positivie numbers!');
      // Add new object to workout array
      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // Render workout on map as marker
    this._workoutPopup(workout);

    // If workout cycling, create cycling object
    //  Check if data makes sense
    if (typeWorkout === 'cycling') {
      if (
        !checkInput(distance, duration, elevation) ||
        !checkPositiveNum(distance, duration)
      )
        return alert('🔴Numbers have to be positivie numbers!');

      // Add new object to workout array
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Add new object to workout array
    this.#workouts.push(workout);

    // Render workout on map as marker
    this._workoutPopup(workout);

    // Render workout on a list
    this._renderWorkout(workout);

    // Hide form
    this._hideForm();

    // Save data to local storage
    this._setLocalStorage();
  }

  // Wrokout marker and popup
  _workoutPopup(workout) {
    L.marker(workout.coordinates)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxHeight: 100,
          autoClose: false,
          closeOnClick: false,
          riseOnHover: true,
          content: `${workout.type === 'running' ? '🏃🏽' : '🚴🏽‍♂️'} ${
            workout.description
          }`,
          className: `${workout.type}-popup`,
        })
      )
      .openPopup();
  }

  // Creates workout list
  _renderWorkout(workout) {
    let html = ` 
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃🏽' : '🚴🏽‍♂️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>`;
    if (workout.type === 'running')
      html += `          
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;

    if (workout.type === 'cycling')
      html += `
        <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(2)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`;

    form.insertAdjacentHTML('afterend', html);
  }

  // Moves user to popup on click (workout list)
  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');

    if (!workoutEl) return;

    const workout = this.#workouts.find(
      (work) => work.id === workoutEl.dataset.id
    );
    console.log(workout);

    this.#map.setView(workout.coordinates, this.#mapZoom, {
      animate: true,
      pan: {
        duration: 1.25,
        easeLinearity: 1,
      },
    });
    // Doesn't work because once object is stored
    // as local  storage, it loses its prototype chain
    //workout.click();
  }

  _setLocalStorage() {
    localStorage.setItem('goblins', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    // convert data(string) back to object
    const data = JSON.parse(localStorage.getItem('goblins'));

    if (!data) return;

    // Fills the empty workouts array
    // with the previous created workouts
    this.#workouts = data;
    // Renders previous workouts on a list
    this.#workouts.forEach((work) => this._renderWorkout(work));
  }

  reset() {
    localStorage.removeItem('goblins');
    location.reload();
  }
}
////////////////////////////////////////////////////////////////////////
//  Parent class
class Workout {
  clicks = 0;
  constructor(coordinates, distance, duration) {
    this.date = new Date();
    this.id = Date.now().toString().slice(-10);
    this.coordinates = coordinates; // [lat, lng]
    this.distance = distance; // in miles
    this.duration = duration; // in mins
  }
  createDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const suffixes = ['th', 'st', 'nd', 'rd'];

    function getDateSuffix(day) {
      // Get correct suffix for the date
      if (day >= 11 && day <= 13) return suffixes[0]; // 'th'

      const lastDigit = day % 10;
      return suffixes[lastDigit] || suffixes[0]; // fallback to 'th'
    }

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}${getDateSuffix(this.date.getDate())}`;
  }

  click() {
    this.clicks++;
  }
}
// Child class
class Running extends Workout {
  type = 'running';
  constructor(coordinates, distance, duration, cadence) {
    super(coordinates, distance, duration);
    this.cadence = cadence; // steps per minute
    this.getPace(); // mins per miles
    this.createDescription(); // workout list below form
  }

  getPace() {
    this.pace = this.duration / this.distance;
  }
}
// Child class
class Cycling extends Workout {
  type = 'cycling';
  constructor(coordinates, distance, duration, elevationGain) {
    super(coordinates, distance, duration);
    this.elevationGain = elevationGain;
    this.getSpeed(); // mph
    this.createDescription(); // workout list below form
  }

  getSpeed() {
    this.speed = this.distance / (this.duration / 60);
  }
}

// Class instances
const app = new App();
