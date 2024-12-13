const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const csvParser = require('csv-parser');
const ml = require('ml-regression');
const path = require('path');
require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const app = express();
const PORT = 4005;

app.use(cors());
app.use(bodyParser.json());

// Fetch historical stock data
async function fetchStockData(symbol) {
  //console.log(symbol);
  const apiKey = `${process.env.API_ADVANTAGE}`; // Replace with your API key
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}&datatype=csv`;
   try {
    const response = await axios.get(url, { responseType: 'stream' });
    //console.log(response);

    if (response.status !== 200) {
      console.error(`API Error: ${response.statusText}`);
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const results = [];
    return new Promise((resolve, reject) => {
      response.data
        .pipe(csvParser())
        .on('data', (data) => {console.log(data); results.push(data);})
        .on('end', () => resolve(results))
        .on('error', (err) => reject(err));
    });
  } catch (err) {
    console.error('Error fetching stock data:', err);
    throw err;
  }
}

// Predict using linear regression
app.post('/predict', async (req, res) => {
  const { symbol } = req.body;

  try {
    const rawData = await fetchStockData(symbol);
   // console.log(rawData);
    const closePrices = rawData.map((d) => parseFloat(d['close'])).reverse();
    const days = Array.from({ length: closePrices.length }, (_, i) => i + 1);

    // Train linear regression model
    const regression = new ml.SLR(days, closePrices);

    // Predict the next day's price
    const nextDay = days[days.length - 1] + 1;
    const predictedPrice = regression.predict(nextDay);

    res.json({ predictedPrice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
