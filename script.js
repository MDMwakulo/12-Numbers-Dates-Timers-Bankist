'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2023-06-20T14:11:59.604Z',
    '2023-07-14T10:17:24.185Z',
    '2023-07-16T14:11:59.604Z',
    '2023-07-18T13:01:17.194Z',
    '2023-07-19T13:36:17.929Z',
    '2023-07-20T13:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return `Today`;
  if (daysPassed === 1) return `Yesterday`;
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const day = `${date.getDate()}`.padStart(2, 0),
  //   month = `${date.getMonth() + 1}`.padStart(2, 0),
  //   year = date.getFullYear();

  // return `${day}/${month}/${year}`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
  const options = {
    style: 'currency',
    currency: currency,
  };
  return new Intl.NumberFormat(locale, options).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const dates = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(dates, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call, print remaining time to the UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }

    // Decrease 1sec
    time--;
  };

  // Set tiime to 5 minutes
  let time = 20;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  console.log(timer);
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 1;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Create Current Date
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long',
    };

    // const locale = navigator.language;

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // const date = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${date}/${month}/${year}, ${hour}:${min}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Timer
    if (timer) {
      clearInterval(timer);
    }
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
  }

  // Restart Timer
  clearInterval(timer);
  timer = startLogOutTimer();
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      // Add loan dates
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);
    }, 2500);
  }
  inputLoanAmount.value = '';

  // Restart Timer
  clearInterval(timer);
  timer = startLogOutTimer();
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;

  // Restart Timer
  clearInterval(timer);
  timer = startLogOutTimer();
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
/*
// Converting and Checking Numbers
console.log(23 === 23.0); // true
console.log(0.1 + 0.2); // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3); // false

// Conversion
console.log(+'23'); // 23
console.log(+'23'); // 23

// Parsing
console.log(Number.parseInt('30px', 10)); // 30
console.log(Number.parseInt('e23', 10)); // 30

console.log(Number.parseFloat('2.5rem')); // 2.5
console.log(Number.parseInt('2.5rem')); // 2

console.log(parseInt('2.5rem')); // 2

// Checking if a vlaue is not a number
console.log(Number.isNaN(20)); // false
console.log(Number.isNaN('20')); // false
console.log(Number.isNaN(+'20X')); // true
console.log(Number.isNaN(23 / 0)); // false

// Checking if a value is a number
console.log(Number.isFinite(20.55)); // true
console.log(Number.isFinite(20)); // true
console.log(Number.isFinite('20')); // false
console.log(Number.isFinite(+'20X')); // false
console.log(Number.isFinite(23 / 0)); // false

console.log(Number.isInteger(23)); // true
console.log(Number.isInteger(23.0)); // true
console.log(Number.isInteger(23.55)); // false
console.log(Number.isInteger(23 / 0)); // false
*/

/*
// Math and Rounding
console.log(Math.sqrt(25)); // 5
console.log(25 ** (1 / 2)); // 5
console.log(8 ** (1 / 3)); // 2

console.log(Math.max(5, 18, 23, 11, 2)); // 23
console.log(Math.max(5, 18, '23', 11, 2)); // 23

console.log(Math.min(5, 18, 23, 11, 2)); // 2

console.log(Math.PI * Number.parseFloat('10px') ** 2); // area of a circle

console.log(Math.floor(Math.random() * 6) + 1);

const randomInt = (min, max) =>
  Math.trunc(Math.random() * (max - min) + 1) + min;
// 0...1 -> 0...(max - min) -> min...max
console.log('0...1 -> 0...(max - min) -> min...max');
console.log(randomInt(10, 20)); // Generate random numbers btw 10 and 20

// Rounding Integers
console.log(Math.trunc(23.3)); // 23

// Rounds to the nearest Integer
console.log(Math.round(23.3)); // 23
console.log(Math.round(23.5)); // 24

// Rounds to the next Integer
console.log(Math.ceil(23.3)); // 24
console.log(Math.ceil(23.5)); // 24

// floor method behaves like trunc
console.log(Math.floor(23.3)); // 23
console.log(Math.floor(23.5)); // 23
console.log(Math.floor('23.5')); // 23

console.log(Math.floor(-23.2)); // 24
console.log(Math.floor(-23.5)); // 24
console.log(Math.trunc(-23.5)); // 23

// Rounding decimals
console.log((2.7).toFixed(0)); // 3
console.log((2.7).toFixed(3)); // 2.700
console.log((2.345).toFixed(2)); // 2.700
console.log(+(2.345).toFixed(2)); // 2.700
*/

/*
// The Remainder Opeartor
console.log(5 % 2);
console.log(5 / 2); // 5 = 2 * 2 + 1

console.log(8 % 3);
console.log(8 / 3); // 8 = 3 * 2 + 2

console.log(6 % 2);
console.log(6 / 2);

console.log(7 % 2);
console.log(7 / 2);

const isEven = n => n % 2 === 0;
console.log(isEven(8));
console.log(isEven(23));
console.log(isEven(514));

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach((row, i) => {
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';
    if (i % 3 === 0) row.style.backgroundColor = 'blue';
  });
});
*/

/*
// Numeric Separator
// 287,460,000,000
const diameter = 287_460_000_000;
console.log(diameter);

const price = 345_99;
console.log(price);

const transferFee1 = 15_00;
const transferFee2 = 1_500;

const PI = 3.14_15; //ERROR
console.log(PI);

console.log(Number('230_000')); // ERROR
console.log(parseInt('230_000')); // 230
*/

/*
// Working with BigInt
console.log(2 ** 53 - 1); // 9007199254740991
console.log(Number.MAX_SAFE_INTEGER); // 9007199254740991
console.log(2 ** 53 - 0); // 9007199254740992

console.log(445345456345645656456345345456456545); // 4.453454563456456e+35
console.log(445345456345645656456345345456456545n); // 445345456345645656456345345456456545n
console.log(BigInt(44534545636545)); // 44534545636545n

// Operations
console.log(10000n + 10000n);
console.log(342432345432343343243243n * 23432343234323432424324334n);
// console.log(Math.sqrt(64n)); // TypeError: Cannot convert a BigInt value to a number

const huge = 5676567656756765678568n;
const num = 5867;
console.log(huge * BigInt(num)); // 33304422442191944236158456n

// Exceptions
console.log(20n > 5); // true
console.log(20n === 20); // false (because we are comparing a regular number with a BigInt number)
console.log(typeof 20n); // bigint
console.log(typeof 20); //  number
console.log(20n == 20); // true
console.log(20 == '20'); // true

console.log(huge + ` is REALLY big!!!`); // 5676567656756765678568 is REALLY big!!!

// Divisions
console.log(10n / 3n); // 3n
console.log(11n / 3n); // 3n
console.log(10 / 3); // 3.3333333333333335
*/

// Create a Date
/*
const now = new Date();
console.log(now);

console.log(new Date('Tue Jul 18 2023 17:13:06 GMT+0300 (East Africa Time)')); // Tue Jul 18 2023 17:13:06 GMT+0300 (East Africa Time)
console.log(new Date('December 24, 2015')); // Thu Dec 24 2015 00:00:00 GMT+0300 (East Africa Time)
console.log(new Date(account1.movementsDates[0]));

console.log(new Date(2023, 6, 18, 17, 35, 45)); // Tue Jul 18 2023 17:35:45 GMT+0300 (East Africa Time)
console.log(new Date(2023, 11, 31)); // Sun Dec 31 2023 00:00:00 GMT+0300 (East Africa Time)

console.log(new Date(0)); // Thu Jan 01 1970 03:00:00 GMT+0300 (East Africa Time)
// 3 days after the Unix time
console.log(new Date(3 * 24 * 60 * 60 * 1000)); // Sun Jan 04 1970 03:00:00 GMT+0300 (East Africa Time)
*/

/*
// Working with dates
const future = new Date(2023, 6, 18, 17, 35);
console.log(future);
console.log(future.getFullYear()); // 2023
console.log(future.getMonth()); // 6
console.log(future.getDate()); // 18
console.log(future.getDay()); // 2
console.log(future.getHours()); // 17
console.log(future.getMinutes()); // 35
console.log(future.getSeconds()); // 0
console.log(future.toISOString()); // 2023-07-18T14:35:00.000Z
console.log(future.getTime()); // 1689690900000
console.log(new Date(1689690900000)); // Tue Jul 18 2023 17:35:00 GMT+0300 (East Africa Time)
console.log(Date.now()); // 1689694357781

future.setFullYear(2040);
console.log(future); // Wed Jul 18 2040 17:35:00 GMT+0300 (East Africa Time)
*/

/*
//Internationalizing Dates (Int)
const future = new Date(2037, 10, 19, 15, 23);
// console.log(+future); // 2142246180000

const calcDaysPassed = (date1, date2) =>
  Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

const days1 = calcDaysPassed(
  new Date(2037, 3, 4),
  new Date(2037, 3, 14, 10, 8)
);
// console.log(days1);
*/

/*
//Internationalizing Numbers (Int)
const num = 3884764.23;
const options = {
  style: 'currency',
  unit: 'celsius',
  currency: 'EUR',
  useGrouping: false, // removes the separators
};

console.log(`US:     `, new Intl.NumberFormat('en-US', options).format(num)); // US:      €3884764.23
console.log(
  `Germany:     `,
  new Intl.NumberFormat('de-DE', options).format(num)
); // Germany:      3884764,23 €
console.log(`Syria:     `, new Intl.NumberFormat('ar-SY', options).format(num)); // Syria:      ‏٣٨٨٤٧٦٤٫٢٣ €
console.log(
  navigator.language,
  new Intl.NumberFormat(navigator.language, options).format(num)
); // en-GB €3884764.23
*/

/*
// setTimeout function
const ingredients = ['olives', 'kales'];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here's your pizza with ${ing1} and ${ing2} 🍕`),
  3000,
  ...ingredients
); // Here's your pizza with olives and kales 🍕
console.log(`Waiting...`);

if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

// setInterval function
setInterval(function () {
  const now = new Date();
  console.log(now);
}, 3000); // Sat Jul 22 2023 01:53:15 GMT+0300 (East Africa Time)
*/
