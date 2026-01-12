import React, { useState, useEffect } from 'react';
import LegalSummarizer from './components/LegalSummarizer.jsx';
import './App.css';

export const ThemeContext = React.createContext();

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    document.body.className = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      <div className={`App ${darkMode ? 'dark' : 'light'}`}>
        <header className="app-header">
          <div className="header-content">
            <img src="/logo.svg" alt="Logo" className="logo" />
            <h1>Document Summarizer</h1>
          </div>
          <button onClick={toggleTheme} className="theme-toggle">
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </header>
        <LegalSummarizer />
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
