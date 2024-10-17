import { getMonth, getYear, getDate, endOfMonth } from 'date-fns';

const months = [
  'ene.',
  'feb.',
  'mar.',
  'abr.',
  'may.',
  'jun.',
  'jul.',
  'ago.',
  'sep.',
  'oct.',
  'nov.',
  'dec.',
];

const today = new Date();
let actualMonth = months[getMonth(today)];
let actualYear = getYear(endOfMonth(today)) - 2000;
let endActualMonth = getDate(endOfMonth(today));

const table = document.querySelector('#datesDisplay');
const resetBtn = document.querySelector('#reset-btn');

let allAppointments = localStorage.getItem('appointments')
  ? JSON.parse(localStorage.getItem('appointments'))
  : {};
if (!localStorage.getItem('appointments')) {
  for (let i = 1; i <= endActualMonth; i++) {
    allAppointments[i] = {
      a: false,
      b: false,
      c: false,
      d: false,
      e: false,
      f: false,
      g: false,
      h: false,
    };
  }
}

function getMonthFromString(monthStr) {
  return months.findIndex((month) => month === monthStr);
}

function getDisplayHours(dayOfWeek) {
  return ['9:00am', '9:00am', '9:00am', '2:00pm', '2:00pm', '2:00pm', '5:00pm'];
}

function displayDates(end, month) {
  const table = document.querySelector('#datesDisplay');

  // Get the actual number of days in the current month
  const actualEnd = getDate(
    endOfMonth(new Date(actualYear + 2000, getMonthFromString(month)))
  );

  // Loop through the actual number of days in the month
  for (let i = 0; i < actualEnd; i++) {
    let row = document.createElement('tr');
    row.setAttribute('data-date', i + 1);
    row.classList.add('visible');
    let title = document.createElement('th');
    title.textContent = `${i + 1} ${month} ${actualYear}`;

    row.appendChild(title);

    const dayOfWeek = new Date(
      actualYear + 2000,
      getMonthFromString(month),
      i + 1
    ).getDay();
    const displayHours = getDisplayHours(dayOfWeek);

    for (let j = 0; j < displayHours.length; j++) {
      let cell = document.createElement('td');
      cell.textContent = displayHours[j];
      cell.setAttribute('data-value', String.fromCharCode(97 + j));

      if (
        allAppointments[`${i + 1}`] &&
        allAppointments[`${i + 1}`][`${cell.getAttribute('data-value')}`] ===
          true
      ) {
        cell.classList.add('marked');
      } else {
        cell.classList.remove('marked');
      }

      row.appendChild(cell);
    }
    table.appendChild(row);
  }
}

function display() {
  table.innerHTML = '';
  displayDates(endActualMonth, actualMonth);

  const cells = document.querySelectorAll('td');
  cells.forEach((cell) => {
    cell.addEventListener('click', (e) => {
      const date = e.target.parentElement.getAttribute('data-date');
      const value = e.target.getAttribute('data-value');

      // Toggle only the clicked cell
      allAppointments[date][value] = !allAppointments[date][value];

      save();
    });
  });

  const dates = document.querySelectorAll('th');
  dates.forEach((date) => {
    date.addEventListener('click', (e) => {
      const dateObj =
        allAppointments[e.target.parentElement.getAttribute('data-date')];
      const allMarked = Object.values(dateObj).every((value) => value === true);

      // Toggle all slots for the clicked date to the opposite of their current state
      Object.keys(dateObj).forEach((slot) => {
        dateObj[slot] = !allMarked;
      });

      save();
    });
  });
}

function reset() {
  Object.keys(allAppointments).forEach((date) => {
    Object.keys(allAppointments[date]).forEach((v) => {
      allAppointments[date][v] = false;
    });
  });

  // Remove the 'appointments' item from local storage
  localStorage.removeItem('appointments');

  save(); // Save the changes
}

resetBtn.addEventListener('click', reset);

function save() {
  localStorage.setItem('appointments', JSON.stringify(allAppointments));
  display();
}

display();

const previousMonthBtn = document.querySelector('#previous-month');
const nextMonthBtn = document.querySelector('#next-month');

previousMonthBtn.addEventListener('click', () => {
  today.setMonth(today.getMonth() - 1);
  updateCalendar();
});

nextMonthBtn.addEventListener('click', () => {
  today.setMonth(today.getMonth() + 1);
  updateCalendar();
});

function updateCalendar() {
  const newMonth = months[getMonth(today)];
  const newYear = getYear(endOfMonth(today)) - 2000;
  const newEndMonth = getDate(endOfMonth(today));

  actualMonth = newMonth;
  actualYear = newYear;
  endActualMonth = newEndMonth;

  display();
  saveState();
}

function saveState() {
  const state = {
    month: actualMonth,
    year: actualYear,
  };

  localStorage.setItem('calendarState', JSON.stringify(state));
}

function restoreState() {
  const stateString = localStorage.getItem('calendarState');

  if (stateString) {
    const state = JSON.parse(stateString);
    actualMonth = state.month;
    actualYear = state.year;
    display(); // Display the calendar with the restored state
  } else {
    // Set initial state if no saved state exists
    const todayMonth = months[getMonth(today)];
    const todayYear = getYear(endOfMonth(today)) - 2000;
    actualMonth = todayMonth;
    actualYear = todayYear;
    display(); // Display the calendar with the initial state
  }
}

restoreState(); // Restore the state of the calendar on page load
