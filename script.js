
'use strict'

// DAILY GOAL PAGE
const searchDailyGoal = document.getElementById('search-daily-goal');
const resultsListDailyGoal = document.getElementById('results-list-daily-goal');
const inputDailyGoal = document.getElementById('input-daily-goal');
const selectForm = document.getElementById('select');
const btnCalcDailyGoal = document.getElementById('btn-calculate-daily-goal');

// FINISH DATE PAGE
const searchFinishDate = document.getElementById('search-finish-date');
const resultsListFinishDate = document.getElementById('results-list-finish-date');
const inputFinishDate = document.getElementById('input-finish-date');
const btnCalcFinishDate = document.getElementById('btn-calculate-finish-date')

// OTHER HTML ELEMENTS
const sectionDailyGoal = document.getElementById('section-daily-goal');
const sectionFinishDate = document.getElementById('section-finish-date');
const sectionResult = document.getElementById('section-result');

const navList = document.getElementById('nav-list');
const navDailyGoal = document.querySelector('.nav-daily-goal');
const navFinishDate = document.querySelector('.nav-finish-date');

const btnsSwitch = document.querySelectorAll('.btn-switch');

// VARIABLES
let resultsArr;
let currShowId;

const errMessageSearch = 'Ops! We seem to be having trouble connecting to the database. Please try again in a bit.';
const errMessageCalc = `It seems like we don't have enough information about this show yet. Sorry about that! Please try another show.`;

const resultsAgainHTML = `        
  <div class="mt-5">
    <p class="fs-5">Try calculating another show!</p>
    <button class="btn btn-secondary btn-again" type="button">Calculate again</button>
  </div>
`;

const reset = () => {
  searchDailyGoal.value = '';
  searchFinishDate.value = '';
  inputDailyGoal.value = '';
  inputFinishDate.value = '';
  currShowId = '';
}

// SEARCH SHOWS
const searchShow = async (e, list) => {
  const searchInput = e.target.value.toLowerCase();
    const searchResult = await fetch(`https://api.tvmaze.com/search/shows?q=${searchInput}`).then(res => res.json()).catch(err => alert(errMessageSearch));
    resultsArr = searchResult.splice(0,10);
    list.innerHTML = '';
    resultsArr.forEach(obj => {
      const show = obj.show;
      const html = `
        <li class="list-group-item gx-0 d-flex row p-2" data-id="${show.id}">
          <div class="col-8 d-flex flex-column align-items-start">
            <h3 class="m-0 h5">${show.name}</h3>
            <p class="h6 text-secondary">(${show.premiered ? show.premiered?.slice(0, 4) : '-'})</p>
          </div>
          <div class="col-4">
            <img src="${show.image ? show.image?.medium : show.image?.original}" alt="${show.name} poster" height="100px" class="float-end">
          </div>
        </li>
      `;

      list.insertAdjacentHTML('beforeend', html);
    });
};

const saveSearchBar = async (e, searchBar, list) => {
  currShowId = e.target.closest('.list-group-item').dataset.id;
  const details =  await fetch(`https://api.tvmaze.com/shows/${currShowId}`).then(res => res.json()).catch(err => alert(errMessageSearch));

  searchBar.value = `${details.name} (${details.premiered ? details.premiered?.slice(0, 4) : '-'})`;
  list.innerHTML = '';
};

searchDailyGoal.addEventListener('input', async (e) => {
  searchShow(e, resultsListDailyGoal)
});

resultsListDailyGoal.addEventListener('click', async (e) => {
  saveSearchBar(e, searchDailyGoal, resultsListDailyGoal)
});

searchFinishDate.addEventListener('input', async (e) => {
  searchShow(e, resultsListFinishDate)
});

resultsListFinishDate.addEventListener('click', async (e) => {
  saveSearchBar(e, searchFinishDate, resultsListFinishDate)
});

// CALCULATE DAILY GOAL
btnCalcDailyGoal.addEventListener('click', async () => {
  if(!inputDailyGoal.value && (!currShowId || !searchDailyGoal.value)) {
    alert('Please choose a show and a daily goal');
    return;
  };
  if(!currShowId || !searchDailyGoal.value) {
    alert('Please select a show');
    return;
  };
  if(!inputDailyGoal.value) {
    alert('Please set a daily goal');
    return;
  };
  const details =  await fetch(`https://api.tvmaze.com/shows/${currShowId}`).then(res => res.json()).catch(err => alert(errMessageCalc));
  const episodes =  await fetch(`https://api.tvmaze.com/shows/${currShowId}/episodes`).then(res => res.json()).catch(err => alert(errMessageCalc));
  const seasons =  await fetch(`https://api.tvmaze.com/shows/${currShowId}/seasons`).then(res => res.json()).catch(err => alert(errMessageCalc));
  const today = new Date();
  const dailyGoalValue = inputDailyGoal.value;
  let daysToFinish;

  if(selectForm.value === 'minutes') {
    const runtime = details.averageRuntime ? details.averageRuntime : details.runtime;
    const totalRuntime = runtime * episodes.length;
    daysToFinish = totalRuntime / dailyGoalValue;
  } else {
    const totalEpisodes = episodes.length;
    daysToFinish = Math.ceil(totalEpisodes / dailyGoalValue);
  };

  const finishDate =  new Date(Number(today) + (1000 * 60 * 60 * 24) * daysToFinish);

  const html = `
    <div class="row justify-content-center">
      <div class="row align-items-center row-gap-4 column-gap-4">
        <p class="col h2">You will finish all <span class="text-primary">${seasons.length} seasons</span> and <span class="text-primary">${episodes.length} episodes</span> of <span class="h1 text-primary">${details.name}</span> by <span class="text-primary">${String(finishDate.getDate()).padStart(2, '0')}/${String(finishDate.getMonth() + 1).padStart(2, '0')}/${finishDate.getFullYear()}</span> if you watch <span class="text-primary">${dailyGoalValue} ${selectForm.value}</span> per day</p>
        <div class="col-md-4 col-xxl-3 bg-secondary-subtle rounded-1 text-center g-0 p-3">
          <img src="${details.image ? details.image?.medium : details.image?.original}" alt="" class="w-100 rounded-1">
          <p class="fs-5 mt-3 mb-0">episode length: ${details.runtime ? details.runtime : (details.averageRuntime ? details.averageRuntime : '0')}m</p>
        </div>
      </div>
      ${resultsAgainHTML}
    </div>
  `;

  sectionResult.insertAdjacentHTML('afterbegin', html);
  sectionDailyGoal.classList.toggle('d-none');
  sectionResult.classList.toggle('d-none');
  navDailyGoal.classList.remove('active');
  reset();
});

// CALCULATE FINISH DATE
btnCalcFinishDate.addEventListener('click', async () => {
  if(!inputFinishDate.value && (!currShowId || !searchFinishDate.value)) {
    alert('Please choose a show and a finish date');
    return;
  }
  if(!currShowId || !searchFinishDate.value) {
    alert('Please select a show');
    return;
  };
  if(!inputFinishDate.value) {
    alert('Please set a daily goal');
    return;
  };

  const details =  await fetch(`https://api.tvmaze.com/shows/${currShowId}`).then(res => res.json()).catch(err => alert(errMessageCalc));
  const episodes =  await fetch(`https://api.tvmaze.com/shows/${currShowId}/episodes`).then(res => res.json()).catch(err => alert(errMessageCalc));
  const seasons =  await fetch(`https://api.tvmaze.com/shows/${currShowId}/seasons`).then(res => res.json()).catch(err => alert(errMessageCalc));
  const today = new Date();
  const finishDate = inputFinishDate.value;
  const date = new Date(finishDate.replace(/-/g, '/'));
  const runtime = details.averageRuntime ? details.averageRuntime : details.runtime;
  const totalRuntime = runtime * episodes.length;

  const daysToFinish = Math.ceil((Number(date) - Number(today)) / (1000 * 60 * 60 * 24));
  const episodesGoal = (episodes.length / daysToFinish).toFixed(1);
  const minutesGoal = Math.ceil(totalRuntime / daysToFinish);

  const html = `
    <div class="row justify-content-center">
      <div class="row align-items-center row-gap-4 column-gap-4">
        <p class="col h2">You need to watch <span class="text-primary">${minutesGoal} minutes</span> or <span class="text-primary">${episodesGoal} episodes</span> of <span class="h1 text-primary">${details.name}</span> per day to finish the show by <span class="text-primary">${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}</span></p>
        <div class="row col-md-4 col-xxl-3 bg-secondary-subtle rounded-1 text-center g-0 p-3 row-gap-3">
          <img src="${details.image ? details.image?.medium : details.image?.original}" alt="" class="w-100 rounded-1">
          <p class="fs-5 my-0">episode length: ${details.runtime ? details.runtime : (details.averageRuntime ? details.averageRuntime : '0')}m</p>
          <p class="fs-5 my-0">number of episodes: ${episodes.length ? episodes.length : 'not available'}</p>
          <p class="fs-5 my-0">number of seasons: ${seasons.length ? seasons.length : 'not available'}</p>
        </div>
      </div>
      ${resultsAgainHTML}
    </div>
  `;

  sectionResult.insertAdjacentHTML('afterbegin', html);
  sectionFinishDate.classList.toggle('d-none');
  sectionResult.classList.toggle('d-none');
  navFinishDate.classList.remove('active');
  reset();
});

// SWITCH SECTIONS
btnsSwitch.forEach((btn) => {
  btn.addEventListener('click', () => {
    sectionDailyGoal.classList.toggle('d-none');
    sectionFinishDate.classList.toggle('d-none');
    navDailyGoal.classList.toggle('active');
    navFinishDate.classList.toggle('active');
    reset();
  });
});

const showDaily = () => {
  sectionFinishDate.classList.add('d-none');
  sectionResult.classList.add('d-none');
  sectionDailyGoal.classList.remove('d-none');
  navDailyGoal.classList.add('active');
  navFinishDate.classList.remove('active');
}; 

navList.addEventListener('click', (e) => {
  if(e.target.classList.contains('nav-daily-goal')) {
    showDaily();
  } else if(e.target.classList.contains('nav-finish-date')) {
    sectionDailyGoal.classList.add('d-none');
    sectionResult.classList.add('d-none');
    sectionFinishDate.classList.remove('d-none');
    navDailyGoal.classList.remove('active');
    navFinishDate.classList.add( 'active');
  } else return;
  sectionResult.innerHTML = '';
  reset();
});

sectionResult.addEventListener('click', (e) => {
  if(e.target.classList.contains('btn-again')) {
    showDaily();
    sectionResult.innerHTML = '';
    reset();
  }
});
