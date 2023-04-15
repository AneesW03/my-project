let dataGlobal;
let trending;
let coinSearch = [];
const searchInput = document.querySelector("[coin-search]");
const searchElement = document.querySelector("#outerContainer");
const alldata = document.querySelector("#alldata");

async function getData(url) {
  try {
    const response = await fetch(url);
    const result = await response.json();
    dataGlobal = result;
    return dataGlobal;
  } catch (e) {
    console.log(e);
  }
}

async function getChartData(url) {
  try {
    const response = await fetch(url);
    const result = await response.json();
    return result.prices;
  } catch (e) {
    console.log(e);
  }
}

async function getTrending() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/search/trending"
    );
    const result = await response.json();
    trending = result.coins;
    return trending;
  } catch (e) {
    console.log(e);
  }
}

function displayCoinData(results) {
  let result = document.querySelector("#coins");
  let html = "";

  results.forEach((rec) => {
    let symbol = rec.symbol.toUpperCase();
    let price = rec.current_price.toLocaleString();
    let change = rec.price_change_percentage_24h_in_currency;
    if (change != null) change = change.toFixed(2);
    else change = 0;
    let marketcap = rec.market_cap.toLocaleString();
    html += `<div id="${rec.id}" class="coin_card">
    <div>
     <div class="card_title" onclick="showDetails(this)">
      <img class="img" src="${rec.image}">
      <div class="card_name">${rec.name}</div>
      <div class="card_name">${symbol}</div>
     </div>
     <div class="card_rank"> Rank <span class="rank_num"> ${rec.market_cap_rank} <span> </div>
    </div>
    <div class="card_data"> <span class="card_span">Price   </span>    $${price}</div>
    <div class="card_data"> <span class="card_span">Change    </span>    ${change}%</div>
    <div class="card_data"> <span class="card_span">Market Cap   </span>    $${marketcap}</div>
    </div>
    `;
  });
  result.innerHTML = html;
}

function showDetails(el) {
  let parentId = el.parentNode.parentNode.id;
  let index;
  for (let i = 0; i < dataGlobal.length; i++) {
    if (dataGlobal[i].id == parentId) {
      index = i;
      break;
    }
  }

  let element = document.querySelector("#content");
  let symbol = dataGlobal[index].symbol.toUpperCase();
  let change = dataGlobal[index].price_change_percentage_24h;
  if (change != null) change = change.toFixed(2);
  else change = 0;
  let marketcap = dataGlobal[index].market_cap.toLocaleString();
  let marketcapchange = dataGlobal[index].market_cap_change_percentage_24h;
  if (marketcapchange != null) {
    marketcapchange = marketcapchange.toFixed(2);
  } else {
    marketcapchange = 0;
  }
  let high = dataGlobal[index].high_24h;
  if (high != null) {
    high = high.toLocaleString();
  } else high = "-";
  let low = dataGlobal[index].low_24h;
  if (low != null) {
    low = low.toLocaleString();
  } else {
    low = "";
  }
  let volume = dataGlobal[index].total_volume.toLocaleString();
  let totalSupply = dataGlobal[index].total_supply;
  let circulatingSupply = dataGlobal[index].circulating_supply.toLocaleString();
  let alltimehigh = dataGlobal[index].ath.toLocaleString();
  let maxSupply = dataGlobal[index].max_supply;
  if (maxSupply == null) {
    maxSupply = "Infinity";
  } else {
    maxSupply = maxSupply.toLocaleString();
  }
  if (totalSupply == null) {
    totalSupply = "Infinity";
  } else {
    totalSupply = totalSupply.toLocaleString();
  }

  let html = "";
  html += `
  <img class="close" onclick="hidePopup()" src="./src/close.png">
  <div class="container">
   <div class="info">
   <div class="token">
   <img class="gimage" src="${dataGlobal[index].image}">
   <span class="name">${dataGlobal[index].name}</span>
   <span class="symbol">${symbol}</span>
   </div>
   <div>
   <span class="price">$${dataGlobal[index].current_price}</span>
   <span class="change">${change}%</span>
   </div>
   </div>
   <div class="market_stats">
   <div class="stats">
    <span>24h High: $${high}</span>
    <span>24h Low: $${low}</span>
    <span>All Time High: $${alltimehigh}</span>
   </div>
   <div class="stats">
    <span>Market Cap: $${marketcap} ${marketcapchange}%</span>
    <span>Total Volume: $${volume}</span>
   </div>
   <div class="stats">
    <span>Total Supply: ${totalSupply}</span>
    <span>Max Supply: ${maxSupply}</span>
    <span>Circulating Supply: ${circulatingSupply}</span>
   </div>
   </div>
  </div>
   <div class="chart">
    <canvas id="myChart"></canvas>
   </div>`;

  element.innerHTML = html;

  overlay.style.display = "block";
  showChart(parentId, 1);
}

function showChart(coinid, days) {
  let string = coinid.charAt(0).toUpperCase() + coinid.slice(1);
  let time = [];
  let price = [];
  let unique = [];
  let count = 0;
  let exist;
  getChartData(
    "https://api.coingecko.com/api/v3/coins/" +
      coinid +
      "/market_chart?vs_currency=usd&days=max"
  ).then((dataArr) => {
    dataArr.forEach((rec) => {
      let date = new Date(rec[0]);
      let year = date.getFullYear();
      time.push(year);
      price.push(rec[1]);
    });

    time.forEach((el) => {
      exist = false;
      unique.forEach((val) => {
        if (val == el) exist = true;
      });
      if (exist == false) unique.push(el);
    });

    count = unique.length;

    const element = document.querySelector("#myChart");

    new Chart(element, {
      type: "line",
      data: {
        labels: time,
        datasets: [
          {
            label: `${string} Price Chart`,
            data: price,
            borderColor: "green",
            borderWidth: "1",
          },
        ],
      },
      options: {
        plugins: {
          zoom: {
            zoom: {
              wheel: {
                enabled: true,
              },
              pan: {
                enabled: true,
              },
              pinch: {
                enabled: true,
              },
              mode: "x",
            },
          },
        },
        elements: {
          point: {
            radius: 0,
          },
        },
        scales: {
          x: {
            grid: {
              display: false, // Remove vertical grid lines
            },
            ticks: {
              maxTicksLimit: count,
            },
          },
          y: {
            min: 0,
            grid: {
              display: true, // Remove horizontal grid lines
            },
            beginAtZero: false,
          },
        },
      },
    });
  });
}

function hidePopup() {
  let element = document.querySelector("#overlay");
  element.style.display = "none";
}

function displayTrending() {
  let result = document.querySelector("#trending");
  let html = "";

  let btcprice;
  for (let key in dataGlobal) {
    if ((dataGlobal[key].id = "bitcoin")) {
      btcprice = dataGlobal[key].current_price;
      break;
    }
  }

  getTrending().then((records) => {
    records.forEach((el) => {
      let symbol = el.item.symbol.toUpperCase();
      let price = (el.item.price_btc * btcprice).toFixed(2);
      html += `
      <div id="${el.item.id}trending" class="trendingcard">
      <div class="card_title">
      <img class="trendingimage" src="${el.item.small}">
      <div class="card_name">${el.item.name}</div>
      </div>
      <div class="card_data"><span class="card_span"> Market Cap Rank </span> ${el.item.market_cap_rank}</div>
      <div class="card_data"><span class="card_span"> Price </span> $${price}</div>
      </div>`;
    });
    result.innerHTML = html;
  });
}

function searchCards() {
  const dataCardTemplate = document.querySelector("[search-card-template]");
  const dataCardContainer = document.querySelector("[data-card-container]");
  const dataCardContainerClone = document.querySelector(
    "[data-card-container-clone]"
  );

  coinSearch = dataGlobal.map((rec) => {
    const card = dataCardTemplate.content.cloneNode(true).children[0];
    const image = card.querySelector("[data-image]");
    const name = card.querySelector("[data-name]");
    image.src = `${rec.image}`;
    name.textContent = `${rec.symbol.toUpperCase()} ${rec.name}`;
    card.id = `${rec.id}search`;
    card.addEventListener("click", function () {
      let elementId = card.id.slice(0, -"search".length).trim();
      const element = document.getElementById(elementId);
      element.classList.toggle("highlight");
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    dataCardContainer.append(card);
    return {
      name: rec.name,
      symbol: rec.symbol,
      element: card,
      coinid: rec.id,
    };
  });
}

getData(
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h%2C24h%2C7d%2C14d%2C30d%2C200d%2C1y&locale=en"
)
  .then((data) => {
    displayCoinData(data);
    displayTrending();
    searchCards();
  })
  .catch((error) => {
    console.error(error);
  });

searchInput.addEventListener("input", (e) => {
  searchElement.style.display = "block";
  const value = e.target.value.toLowerCase();
  coinSearch.forEach((coin) => {
    const isVisible =
      coin.name.toLowerCase().includes(value) ||
      coin.symbol.toLowerCase().includes(value);
    coin.element.classList.toggle("hide", !isVisible);
  });
});

searchElement.addEventListener("click", () => {
  searchElement.style.display = "none";
});
searchInput.addEventListener("blur", () => {
  searchInput.value = "";
});
