// src/App.js

import React from 'react';
import AddSTIX from './AddSTIX';

function App() {
  return (
    <div className="App">
      <div id="top-header-bar">
        <h1>
          <span id="header">Menpo</span>
        </h1>
        <a href="https://github.com/bentobox19/menpo-bravo/">
          <img src="images/GitHub-Mark-64px.png" alt="View source on GitHub" width="32" height="32"></img>
        </a>
      </div>

      <div>
        <AddSTIX />
      </div>
    </div>
  );
}

export default App;
