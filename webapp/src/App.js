// src/App.js

import React from 'react';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';

function App() {
  return (
    <div className="App">
      <div style={{ display: 'flex' }}>
        <LeftPanel />
        <RightPanel />
      </div>
    </div>
  );
}

export default App;
