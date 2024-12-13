const express = require('express');
const axios = require('axios');
const ml = require('ml-regression'); // Linear regression library

const path = require('path');
require("dotenv").config({
  path: path.join(__dirname, ".env"),
});
const cors = require('cors');
const app = express();
const port = 4009;

app.use(cors());

app.use(express.json());

// Fetch stock data from Finnhub API
const fetchStockData = async (symbol) => {
  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`;
    const response = await axios.get(url);
    
    // Return the response data in a usable format
    // console.log(response.data);
    return {
      current: response.data.c,  // Current price
      high: response.data.h,      // High price of the day
      low: response.data.l,       // Low price of the day
      open: response.data.o,      // Open price of the day
      volume: response.data.v,    // Volume of the day
    };
  } catch (error) {
    throw new Error('Error fetching stock data from Finnhub');
  }
};

// Predict using linear regression
app.post('/predict', async (req, res) => {
  const { symbol } = req.body;

  try {
    // Fetch stock data from Finnhub
    const stockData = await fetchStockData(symbol);

    // Simulate a dataset for prediction (In a real case, you would need historical data for better predictions)
    const simulatedData = [
      { day: 1, close: stockData.current },
      { day: 2, close: stockData.current - 0.5 },
      { day: 3, close: stockData.current - 1 },
      { day: 4, close: stockData.current + 0.5 },
      { day: 5, close: stockData.current + 1 },
    ];

    const closePrices = simulatedData.map((d) => parseFloat(d.close));
    const days = Array.from({ length: closePrices.length }, (_, i) => i + 1);

    // Train linear regression model
    const regression = new ml.SLR(days, closePrices);

    // Predict the next day's price
    const nextDay = days[days.length - 1] + 1;
    const priceNextDay = regression.predict(nextDay);

    // Predict the price after 15 days
    const dayAfter15 = days[days.length - 1] + 15;
    const priceAfter15 = regression.predict(dayAfter15);

    // Predict the price after 1 month (30 days)
    const dayAfter30 = days[days.length - 1] + 30;
    const priceAfter30 = regression.predict(dayAfter30);

    res.json({
      predictedPriceNextDay: priceNextDay,
      predictedPriceAfter15Days: priceAfter15,
      predictedPriceAfter30Days: priceAfter30,
      stockData,  // Return fetched stock data for reference
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
