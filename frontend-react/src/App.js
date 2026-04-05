import React from 'react';
import Biblioteca from './components/Biblioteca';

function App() {
  return (
    <div className="App">
      <header style={{ backgroundColor: '#6366f1', padding: '10px', color: 'white', textAlign: 'center' }}>
        <h1>Bibliocresta - Panel de Control</h1>
      </header>
      <main>
        <Biblioteca />
      </main>
    </div>
  );
}

export default App;
