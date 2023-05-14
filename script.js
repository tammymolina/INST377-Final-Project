/*
  Hook this script to index.html
  by adding `<script src="script.js">` just before your closing `</body>` tag
*/


function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

function injectHTML(list) {
  console.log('fired injectHTML');
  const target = document.querySelector('.tv_list');
  target.innerHTML = '';
  list.forEach((item) => {
    const str = `<li>${item.name}</li>`;
    target.innerHTML += str;
  })
}

/* A quick filter that will return something based on a matching input */
function filterList(list, query) {
  return list.filter((item) => {
    const lowerCaseName = item.show.toLowerCase();
    const lowerCaseQuery = query.toLowerCase();
    return lowerCaseName.includes(lowerCaseQuery)
  })
}

function getCast(showId) {
  return fetch(`https://api.tvmaze.com/shows/${showId}/cast`)
    .then(response => response.json());
}

// Select a random sample of shows and fetch their cast data
function getCastData(shows) {
  // Select 15 random shows from the list
  const selectedShows = selectRandomShows(shows, 15);

  // Fetch the cast data for each selected show and count the number of male and female cast members
  const castData = [];
  let count = 0;
  selectedShows.forEach(show => {
    getCast(show.id)
      .then(cast => {
        const counts = {
          male: 0,
          female: 0
        };
        cast.forEach(castMember => {
          if (castMember.person.gender === 'Male') {
            counts.male++;
          } else if (castMember.person.gender === 'Female') {
            counts.female++;
          }
        });
        castData.push({
          show: show.name,
          counts: counts
        });
        count++;
        if (count === selectedShows.length) {
          return plotChart(castData);
        }
      });
  });
}

// function to select random shows from an array of shows
function selectRandomShows(shows, count) {
  const selectedShows = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * shows.length);
    selectedShows.push(shows[randomIndex]);
    shows.splice(randomIndex, 1);
  }
  return selectedShows;
}

// function to plot the chart 
function plotChart(data) {
  const labels = data.map(d => d.show);
  const maleCounts = data.map(d => d.counts.male);
  const femaleCounts = data.map(d => d.counts.female);

  const ctx = document.getElementById('myChart').getContext('2d');
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Male',
        data: maleCounts,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        stack: 'combined'
      }, {
        label: 'Female',
        data: femaleCounts,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        type: 'bar'
      }]
    },
    options: {
      scales: {
        y: {
          stacked: true
        }
      }
    }
  });
}

async function getTvShows() {
  const response = await fetch('https://api.tvmaze.com/shows');
  const shows = await response.json();
  return shows;
}

async function getCastData2(shows) {
  const castData = [];
  for (const show of shows) {
    const response = await fetch(`https://api.tvmaze.com/shows/${show.id}/cast`);
    const cast = await response.json();
    const maleCount = cast.filter(c => c.person.gender === 'Male').length;
    const femaleCount = cast.filter(c => c.person.gender === 'Female').length;
    castData.push({
      show: show.name,
      counts: {
        male: maleCount,
        female: femaleCount
      }
    });
  }
  return castData;
}

function getRandomElements2(arr, numElements) {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numElements);
}


async function updateChart() {
  fetch('https://api.tvmaze.com/shows')
    .then(response => response.json())
    .then(async shows => {
      // get random  15 shows
      const selectedShows = await getTvShows();
      console.log("selectedShows: ", selectedShows);

      // get cast data for the selected shows
      const castData = await getCastData2(selectedShows); // await the promise here

      const randomShows = getRandomElements2(castData, 15);
      console.log("randomShows in updateChart(): ", randomShows);


      //get the chart instance
      const chart = Chart.instances[0];

      // update
      console.log("castData in updateChart(): ", randomShows);
      chart.data.labels = randomShows.map(d => d.show);
      chart.data.datasets[0].data = randomShows.map(d => d.counts.male);
      chart.data.datasets[1].data = randomShows.map(d => d.counts.female);

      chart.update();
    })
    .catch(error => console.error(error));
}

async function updateChart_fourpm(randomShows) { /* trying this new one */
  const chart = Chart.instances[0];
  
  chart.data.labels = randomShows.map(d => d.show);
  chart.data.datasets[0].data = randomShows.map(d => d.counts.male);
  chart.data.datasets[1].data = randomShows.map(d => d.counts.female);

  chart.update();
}


async function updateChart_exist(shows) {
  const castData = await getCastData2(shows); // await the promise here
  const randomShows = getRandomElements2(castData, 15);

  //gete chart instance
  const chart = Chart.instances[0];

  //update the chart data
  chart.data.labels = randomShows.map(d => d.show);
  chart.data.datasets[0].data = randomShows.map(d => d.counts.male);
  chart.data.datasets[1].data = randomShows.map(d => d.counts.female);

  chart.update();
}

function updateChart_forTextfield(filtered_list) {
  // chart instance
  const chart = Chart.instances[0];

  //updating
  console.log("filtered_list in updateChart_forTextfield(): ", filtered_list);
  chart.data.labels = filtered_list.map(d => d.show);
  chart.data.datasets[0].data = filtered_list.map(d => d.counts.male);
  chart.data.datasets[1].data = filtered_list.map(d => d.counts.female);

  chart.update();
}

async function mainEvent() { // the async keyword means we can make API requests
  const mainForm = document.querySelector('.main_form'); // This class name needs to be set on your form before you can listen for an event on it
  const filterButton = document.querySelector('.filter_button');
  const loadDataButton = document.querySelector('#data_load');
  const clearDataButton = document.querySelector('#data_clear');
  const generateListButton = document.querySelector('#generate');
  const textField = document.querySelector('#tv');


  const loadAnimation = document.querySelector('#data_load_animation');
  loadAnimation.style.display = 'none';
  generateListButton.classList.add('hidden');
  clearDataButton.classList.add('hidden');


  const chartTarget = document.querySelector('#myChart');

  let currentList = []; // this is "scoped" to the main event function
  let gener_chart = null; //empty chart
  let randomShows = []; //empty list of random TV shows

  const storedData = localStorage.getItem('storedData'); /* local storage stuff */
  const storedDataCast = localStorage.getItem('storedDataCast'); /* local storage stuff */
  let parsedData = JSON.parse(storedData);
  let parsedDataCast = JSON.parse(storedDataCast);
  console.log("outside parsedData?.length: ", parsedData?.length);
  if (parsedData?.length > 0 && parsedDataCast?.length > 0) {
    console.log("parsedData?.length: ", parsedData?.length);
    generateListButton.classList.remove('hidden');
    clearDataButton.classList.remove('hidden');
  }

  /* We need to listen to an "event" to have something happen in our page - here we're listening for a "submit" */
  loadDataButton.addEventListener('click', async (submitEvent) => { // async has to be declared on every function that needs to "await" something
    console.log('Loading data');   // this is substituting for a "breakpoint" - it prints to the browser to tell us we successfully submitted the form
    loadAnimation.style.display = 'inline-block';

    /* API data request */

    // Get a random subset of 15 shows
    const selectedShows = await getTvShows();
    console.log("selectedShows: ", selectedShows);

    // Get the cast data for the selected shows
    const castData = await getCastData2(selectedShows); // await the promise here

    // This changes the response from the GET into data we can use - an "object"
    const storedListShows = selectedShows;    /* local storage stuff */
    const storedListCast = getRandomElements2(castData, 15);
    console.log("storedListCast: ", storedListCast)
    localStorage.setItem('storedData', JSON.stringify(storedListShows));
    localStorage.setItem('storedDataCast', JSON.stringify(storedListCast));
    parsedData = storedListShows;
    parsedDataCast = storedListCast;

    if (parsedData?.length > 0 && parsedDataCast?.length > 0) {
      generateListButton.classList.remove('hidden');
      clearDataButton.classList.remove('hidden');
      console.log("in load data buttn parsedData?.length: ", parsedData?.length);
    }

    loadAnimation.style.display = 'none';
    //console.table(randomShows);
    injectHTML(selectedShows);
  });

  /*
    This array initially contains all 1,000 records from your request,
    but it will only be defined _after_ the request resolves - any filtering on it before that
    simply won't work.
  */

  generateListButton.addEventListener('click', (event) => {
    console.log('generate chart');
    //console.log("tv_shows in bttn function: ", tv_shows);
    //getCastData(tv_shows);
    if (gener_chart) {
      console.log('if gener_chart');
      updateChart();

    } else {
      console.log('else in generate');
      //plot the chart 
      //gener_chart = plotChart(randomShows);
      console.log("parsedDataCast: ", parsedDataCast);
      randomShows = getRandomElements2(parsedDataCast, 15);
      gener_chart = plotChart(randomShows); // this generate a chart of all show cast data using local storage. try calling rand list funct on parsedCastData
    }
  })

  textField.addEventListener('input', (event) => { /* lab 7 */
    console.log('input', event.target.value);
    console.log("typeof randomShows in textfield: ", typeof (randomShows));
    console.log("randomShows: ", randomShows);
    const newList = filterList(randomShows, event.target.value);
    console.log("newlist in textfield: ", newList);
    if (newList != randomShows) {
      if (gener_chart) {
        updateChart_forTextfield(newList);
        console.log("textfield: if gener_chart");
      } else {
        plotChart(newList);
        console.log("textfield: else");

      }
    }
  })

  clearDataButton.addEventListener("click", (event) => {
    console.log('clear browser data');
    localStorage.clear();
    console.log('localStorage Check', localStorage.getItem("storedData"));
  })
}

/*
  This adds an event listener that fires our main event only once our page elements have loaded
  The use of the async keyword means we can "await" events before continuing in our scripts
  In this case, we load some data when the form has submitted
*/
document.addEventListener('DOMContentLoaded', async () => mainEvent()); // the async keyword means we can make API requests
