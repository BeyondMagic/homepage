function start() {
  startTime();
  findQuote();
  readRSS();
}

// if you type anything on the screen it will focus on the search input
function focusOn() {
  document.getElementById("input").focus();
}

// load a random quote of the quotes.json file
function findQuote() {
  const numberQuotes = quotes.length;
  // get random number
  const idChosen = Math.floor(Math.random() * Math.floor(numberQuotes));
  // get the quote
  const chosen = quotes[idChosen];
  console.log(`You have ${numberQuotes} quotes.`);
  if (chosen !== undefined) {
    document.getElementById('quote').innerHTML = chosen.quote;
    document.getElementById('author').innerHTML = chosen.author;
    if (chosen.source !== undefined)
      document.getElementById('source').innerHTML = chosen.source;
    else document.getElementById('spaceBetweenInf').innerHTML = '';
  }
}

// first search type will always be google
let actualQuery = 'google';

// change the search type every time you click
function changeQuery() {
  const form = document.getElementById("form");
  const input = document.getElementById("input");
  const text = document.getElementById("search");
  switch (actualQuery) {
    case 'google':
      actualQuery = 'youtube';
      form.setAttribute("action", "https://www.youtube.com/results");
      input.setAttribute("name", "search_query");
      break;
    case 'youtube':
      actualQuery = 'github';
      form.setAttribute("action", "https://github.com/search");
      input.setAttribute("name", "q")
      break;
    case 'github':
      actualQuery = 'reddit';
      form.setAttribute('action', 'https://www.reddit.com/search/');
      //input.setAttribute("name", "q");
      break;
    case 'reddit':
      actualQuery = 'google';
      form.setAttribute("action", "https://www.google.com/search");
      //input.setAttribute("name", "q");
      break;
  }
  text.innerHTML = actualQuery;
}

// load time in the screen
function startTime() {
  const date = new Date();
  let h = date.getHours();
  let m = date.getMinutes();
  let s = date.getSeconds();
  h = formatTime(h);
  m = formatTime(m);
  s = formatTime(s);
  document.getElementById('ctime').innerHTML = `${h}:${m}:${s}`;
  setTimeout('startTime()', 500);
}

// format time for better output (with zeros)
function formatTime(i) {
  if (i < 10) i = "0" + i;
  return i;
}

/* JSON reader */
const getJSON = function(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';
  xhr.onload = function() {
    var status = xhr.status;
    if (status === 200) {
      callback(null, xhr.response);
    } else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
}

// format the element
function formatElement(el) {
  let date = el.querySelector("pubDate").innerHTML;
  const linke = el.querySelector("link").innerHTML;
  let title = el.querySelector("title").innerHTML;
  // bbc remove comment on title
  title = title.replace(/<!\[CDATA\[|\]+>/gi, '');
  // globo (g1) remove numbers
  date = date.replace('-0000', 'GMT-3');
  return `
    <article>
      <span class="dateNews" width="64" height="64">${date}</span>
      <a class="news" href="${linke}" rel="noopener">
        ${title}
      </a>
    </article>
    `
}

// format money for better output
function formatMoney(amount, decimalCount = 2, decimal = ".", thousands = ",") {
  try {
    decimalCount = Math.abs(decimalCount);
    decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

    const negativeSign = amount < 0 ? "-" : "";

    let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
    let j = (i.length > 3) ? i.length % 3 : 0;

    return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
  } catch (e) {
    console.log(e);
  }
}

// try read all the rss and json of the sites
function readRSS() {
  // proxy for cross origin
  const proxy = `https://cors-anywhere.herokuapp.com/`;

  // sites to read rss and json
  const globo = `https://g1.globo.com/rss/g1/`;
  const bbcWorld = `feeds.bbci.co.uk/news/world/rss.xml`;
  const tickerCoin = `https://blockchain.info/ticker`;
  const tickerReal = `https://economia.awesomeapi.com.br/all/USD-BRL,EUR-BRL`;

  // elements to change
  const g1 = document.getElementById("globo");
  const bbc = document.getElementById("bbc");
  const bitcoin = document.getElementById("bitcoin");
  const real = document.getElementById("real");

  // loader before loads everything
  const loader = `<div class="lds-dual-ring"></div>`;
  g1.innerHTML, bbc.innerHTML, bitcoin.innerHTML, real.innerHTML = loader;

  /* Globo (G1) RSS */
  try {
    fetch(proxy + globo)
      .then(response => response.text())
      .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
      .then(data => {
        const items = data.querySelectorAll("item");
        let html = `<h4 class="showNews" color="gray">G1</h4>`;
        items.forEach(el => {
          html += formatElement(el);
        });
        g1.innerHTML = '';
        g1.insertAdjacentHTML("beforeend", html);
      });
  } catch (err) {
    console.log("Globo (G1) did not fetched correctly, \n", err);
  }

  /* BBC World RSS */
  try {
    fetch(proxy + bbcWorld)
      .then(response => response.text())
      .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
      .then(data => {
        const items = data.querySelectorAll("item");
        let html = `<h4 class="showNews" color="gray">BBC World</h4>`;
        items.forEach(el => {
          html += formatElement(el);
        });
        bbc.innerHTML = '';
        bbc.insertAdjacentHTML("beforeend", html);
      });
  } catch (err) {
    console.log("BBC World did not fetched correctly, \n", err);
  }

  /* Bitcoin JSON */
  try {
    getJSON(tickerCoin, (err, data) => {
      if (err !== null) bitcoin.innerHTML = ':(' + err;
      else {
        bitcoin.innerHTML = '';
        let html = `<h4 class="showNews" color="gray">1 Bitcoin</h4>`;
        html += `USD ${data.USD.symbol} <span class="currency">${formatMoney(data.USD.last)}</span>
      <br>`;
        html += `BRL ${data.BRL.symbol} <span class="currency">${formatMoney(data.BRL.last)}</span>`;
        bitcoin.insertAdjacentHTML("beforeend", html);
      }
    });
  } catch (err) {
    console.log("Did not got Bitcoin values correctly, \n", err);
  }

  /* Real JSON */
  try {
    getJSON(tickerReal, (err, data) => {
      if (err !== null) real.innerHTML = ':(' + err;
      else {
        real.innerHTML = '';
        let html = `<h4 class="showNews" color="gray">1 Real</h4>`;
        html += `USD $ <span class="currency">${formatMoney(data.USD.high)}</span>
      <br>`;
        html += `EUR £ <span class="currency">${formatMoney(data.EUR.high)}</span>`;
        real.insertAdjacentHTML("beforeend", html);
      }
    });
  } catch (err) {
    console.log("Did not got Bitcoin values correctly, \n", err);
  }
}