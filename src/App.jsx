import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRound, setSelectedRound] = useState('All');
  
  // STRETCH FEATURES: Numerical range boundary state variables
  const [minGoals, setMinGoals] = useState(0);
  const [maxGoals, setMaxGoals] = useState(8);

  // Summary statistics state metrics
  const [stats, setStats] = useState({
    totalMatches: 0,
    totalGoals: 0,
    totalDraws: 0
  });

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        // Fetching the 2024-25 Premier League season dataset
        const response = await fetch('https://raw.githubusercontent.com/openfootball/football.json/master/2024-25/en.1.json');
        const data = await response.json();
        
        const matches = data.matches || [];
        
        setList(matches);
        setFilteredList(matches);
        calculateSoccerStats(matches);
      } catch (error) {
        console.error("Error retrieving soccer data: ", error);
      }
    };

    fetchMatchData();
  }, []);

  const calculateSoccerStats = (matches) => {
    const total = matches.length;
    
    // Sum up all goals scored
    const goals = matches.reduce((sum, match) => {
      const homeScore = match.score?.ft?.[0] || 0;
      const awayScore = match.score?.ft?.[1] || 0;
      return sum + homeScore + awayScore;
    }, 0);

    // Count how many matches ended in a draw
    const draws = matches.filter(match => {
      const homeScore = match.score?.ft?.[0];
      const awayScore = match.score?.ft?.[1];
      return homeScore !== undefined && homeScore === awayScore;
    }).length;

    setStats({
      totalMatches: total,
      totalGoals: goals,
      totalDraws: draws
    });
  };

  // Synchronizing multiple filters simultaneously (Search, Dropdown, and Slider Range Bounds)
  useEffect(() => {
    let result = list;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(match => 
        match.team1.toLowerCase().includes(query) || 
        match.team2.toLowerCase().includes(query)
      );
    }

    if (selectedRound !== 'All') {
      result = result.filter(match => match.round === selectedRound);
    }

    // Filter by strict lower and upper goal boundaries
    result = result.filter(match => {
      const totalMatchGoals = (match.score?.ft?.[0] || 0) + (match.score?.ft?.[1] || 0);
      return totalMatchGoals >= minGoals && totalMatchGoals <= maxGoals;
    });

    setFilteredList(result);
  }, [searchQuery, selectedRound, minGoals, maxGoals, list]);

  return (
    <div className="app-container">
      <header className="header-section">
        <h1>⚽ Premier League Match Insights</h1>
        <p>Analyze recent seasonal fixture statistics, results, and distributions.</p>
      </header>

      {/* --- Summary Statistics Row --- */}
      <div className="stats-container">
        <div className="card">
          <h3>Fixtures Loaded</h3>
          <p className="stat-number">{stats.totalMatches}</p>
        </div>
        <div className="card">
          <h3>Total Goals Scored</h3>
          <p className="stat-number" style={{ color: '#4ade80' }}>{stats.totalGoals}</p>
        </div>
        <div className="card">
          <h3>Drawn Matches</h3>
          <p className="stat-number" style={{ color: '#fbbf24' }}>{stats.totalDraws}</p>
        </div>
      </div>

      {/* --- Controls Section (Handles Text, Select, and Range inputs) --- */}
      <div className="controls-container">
        <input 
          type="text" 
          placeholder="Search by team name (e.g. Arsenal, Chelsea)..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-bar"
        />

        <select 
          value={selectedRound} 
          onChange={(e) => setSelectedRound(e.target.value)}
          className="filter-dropdown"
        >
          <option value="All">All Matchdays</option>
          <option value="Matchday 1">Matchday 1</option>
          <option value="Matchday 2">Matchday 2</option>
          <option value="Matchday 3">Matchday 3</option>
          <option value="Matchday 4">Matchday 4</option>
          <option value="Matchday 5">Matchday 5</option>
        </select>

        {/* STRETCH FEATURE UI: Dual Range Bounds Control inputs with Crossover Protection */}
        <div className="slider-card">
          <label>Goal Range Boundaries</label>
          <div className="range-controls">
            <div>
              <span>Min: <strong>{minGoals}</strong></span>
              <input 
                type="range" 
                min="0" 
                max="8" 
                value={minGoals} 
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val <= maxGoals) setMinGoals(val);
                }} 
                className="goal-slider"
              />
            </div>
            <div>
              <span>Max: <strong>{maxGoals}</strong></span>
              <input 
                type="range" 
                min="0" 
                max="8" 
                value={maxGoals} 
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= minGoals) setMaxGoals(val);
                }} 
                className="goal-slider"
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- Match Data List View --- */}
      <div className="list-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Matchday</th>
              <th style={{ textAlign: 'center' }}>Fixture & Scoreboard</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.length > 0 ? (
              filteredList.map((match, index) => (
                <tr key={index}>
                  <td>{match.date}</td>
                  <td><span className="badge">{match.round}</span></td>
                  <td className="fixture-cell">
                    <span className="team-name home">{match.team1}</span>
                    <span className="score-pill">
                      {match.score?.ft?.[0] !== undefined ? match.score.ft[0] : '-'} - {match.score?.ft?.[1] !== undefined ? match.score.ft[1] : '-'}
                    </span>
                    <span className="team-name away">{match.team2}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>
                  No match fixtures found matching those search metrics.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;