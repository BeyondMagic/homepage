function start() {
	startTime();
	findQuote();
  readRSS();
}

function findQuote() {
	const numberQuotes = quotes.length;
	const idChosen = Math.floor(Math.random() * Math.floor(numberQuotes));
	const chosen = quotes[idChosen];
	console.log(`You have ${numberQuotes} quotes.`);
	document.getElementById('quote').innerHTML = chosen.quote;
	document.getElementById('author').innerHTML = chosen.author;
	document.getElementById('source').innerHTML = chosen.source;
}

let actualQuery = 'google';

function changeQuery() {
  const form = document.getElementById("form");
  const input = document.getElementById("input");
  const text = document.getElementById("search");
  switch(actualQuery) {
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

function startTime() {
	const date = new Date();
	let h = date.getHours();
	let m = date.getMinutes();
	let s = date.getSeconds();
	h = formatTime(h);
	m = formatTime(m);
	s = formatTime(s);
	document.getElementById('ctime').innerHTML = `${h}:${m}:${s}`;
	let t = setTimeout('startTime()', 500);
}

function formatTime(i) {
	if ( i < 10) i = "0" + i;
	return i;
}

/* Leitura de RSS */

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

function formatElement(el) {
  let date = el.querySelector("pubDate").innerHTML;
  const linke = el.querySelector("link").innerHTML;
  let title = el.querySelector("title").innerHTML;
  // bbc remove comment on title
  title = title.replace(/<!\[CDATA\[|\]+>/gi, '');
  // globo (g1) remove numbers
  date = date.replace(' -0000', '');
  return `
    <article>
      <span class="dateNews" width="64" height="64">${date}</span>
      <a class="news" href="${linke}" target="_blank" rel="noopener">
        ${title}
      </a>
    </article>
    `
}

function formatMoney(amount, decimalCount = 2, decimal = ".", thousands = ",") {
  try {
    decimalCount = Math.abs(decimalCount);
    decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

    const negativeSign = amount < 0 ? "-" : "";

    let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
    let j = (i.length > 3) ? i.length % 3 : 0;

    return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
  } catch (e) {
    console.log(e)
  }
}

function readRSS() {
  const proxy = `https://cors-anywhere.herokuapp.com/`;
  
  const globo = `https://g1.globo.com/rss/g1/`;
  const bbcWorld = `feeds.bbci.co.uk/news/world/rss.xml`;
  const tickerCoin = `https://blockchain.info/ticker`;
  const tickerReal = `https://economia.awesomeapi.com.br/all/USD-BRL,EUR-BRL,BTC-BRL`;
  
  const correio = document.getElementById("correio");
  const bbc = document.getElementById("bbc");
  const bitcoin = document.getElementById("bitcoin");
  const real = document.getElementById("real");
  
  const loader = `<div class="lds-dual-ring"></div>`;
  correio.innerHTML, bbc.innerHTML, bitcoin.innerHTML, real.innerHTML = loader;
  
  fetch(proxy + globo)
  .then(response => response.text())
  .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
  .then(data => {
    const items = data.querySelectorAll("item");
    let html = `<h4 class="showNews" color="gray">G1</h4>`;
    items.forEach(el => {
      html += formatElement(el);
    });
    correio.innerHTML = '';
    correio.insertAdjacentHTML("beforeend", html);
  });
  
  /* BBC World */
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
  
  /* Bitcoin */
  try {
  getJSON(tickerCoin, (err, data) => {
    if (err !== null) throw ':(' + err;
    else {
      bitcoin.innerHTML = '';
      let html = `<h4 class="showNews" color="gray">1 Bitcoin</h4>`;
      html += `USD ${data.USD.symbol} <span class="currency">${formatMoney(data.USD.last)}</span>
      <br>`;
      html += `BRL ${data.BRL.symbol} <span class="currency">${formatMoney(data.BRL.last)}</span>`;
      bitcoin.insertAdjacentHTML("beforeend", html);
    }
  });
  }
  catch (err) {
    console.log("Did not got Bitcoin values correctly, \n", err);
  }
  
  /* Real */
  try {
  getJSON(tickerReal, (err, data) => {
    if (err !== null) throw ':(' + err;
    else {
      real.innerHTML = '';
      let html = `<h4 class="showNews" color="gray">1 Real</h4>`;
      html += `USD $ <span class="currency">${formatMoney(data.USD.high)}</span>
      <br>`;
      html += `EUR £ <span class="currency">${formatMoney(data.EUR.high)}</span>`;
      real.insertAdjacentHTML("beforeend", html);
    }
  });
  }
  catch (err) {
    console.log("Did not got Bitcoin values correctly, \n", err);
  }
}