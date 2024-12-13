import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [symbol, setSymbol] = useState('');
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:4009/predict', { symbol });
      setPredictions(response.data);
    } catch (err) {
      setError('Failed to fetch predictions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Stock Market Predictor</h1>
      <input
        type="text"
        placeholder="Enter Stock Symbol (e.g., AAPL)"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
      />
      <button onClick={handlePredict} disabled={loading}>
        {loading ? 'Predicting...' : 'Predict'}
      </button>
      {predictions && (
        <div>
          <h2>Predictions:</h2>
          <p>Next Day: ${predictions.predictedPriceNextDay.toFixed(2)}</p>
          <p>After 15 Days: ${predictions.predictedPriceAfter15Days.toFixed(2)}</p>
          <p>After 1 Month: ${predictions.predictedPriceAfter30Days.toFixed(2)}</p>
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default App;
