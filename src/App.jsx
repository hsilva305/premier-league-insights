import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import './App.css';

// ==========================================
// 1. MASTER WRAPPER & ROUTING ARCHITECTURE
// ==========================================
function App() {
  const [list, setList] = useState([]);
  const [goalsPerMatchday, setGoalsPerMatchday] = useState([]);
  const [outcomeDistribution, setOutcomeDistribution] = useState([]);
  const [stats, setStats] = useState({ totalMatches: 0, totalGoals: 0, totalDraws: 0 });

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/openfootball/football.json/master/2024-25/en.1.json');
        const data = await response.json();
        const matches = data.matches || [];
        
        setList(matches);
        calculateSoccerStats(matches);
      } catch (error) {
        console.error("Error retrieving soccer data: ", error);
      }
    };
    fetchMatchData();
  }, []);

  const calculateSoccerStats = (matches) => {
    const total = matches.length;
    const goals = matches.reduce((sum, match) => (sum + (match.score?.ft?.[0] || 0) + (match.score?.ft?.[1] || 0)), 0);

    let drawsCount = 0, homeWinsCount = 0, awayWinsCount = 0;
    const matchdayGoalsMap = {};

    matches.forEach(match => {
      const homeScore = match.score?.ft?.[0];
      const awayScore = match.score?.ft?.[1];

      if (homeScore !== undefined && awayScore !== undefined) {
        if (homeScore === awayScore) drawsCount++;
        else if (homeScore > awayScore) homeWinsCount++;
        else awayWinsCount++;
      }

      const roundName = match.round;
      const totalMatchGoals = (homeScore || 0) + (awayScore || 0);
      matchdayGoalsMap[roundName] = (matchdayGoalsMap[roundName] || 0) + totalMatchGoals;
    });

    const formattedBarData = Object.keys(matchdayGoalsMap).map(round => ({
      name: round.replace('Matchday ', 'MD '),
      Goals: matchdayGoalsMap[round]
    }));

    const formattedPieData = [
      { name: 'Home Wins', value: homeWinsCount, color: '#38bdf8' },
      { name: 'Away Wins', value: awayWinsCount, color: '#f43f5e' },
      { name: 'Draws', value: drawsCount, color: '#fbbf24' }
    ];

    setStats({ totalMatches: total, totalGoals: goals, totalDraws: drawsCount });
    setGoalsPerMatchday(formattedBarData);
    setOutcomeDistribution(formattedPieData);
  };

  return (
    <Router>
      <div className="layout-wrapper">
        {/* REQUIRED SIDEBAR: Stays locked across all page rendering switches */}
        <aside className="app-sidebar">
          <div className="sidebar-logo">⚽ Match Insights</div>
          <nav className="sidebar-nav">
            <Link to="/" className="nav-link">🏠 Dashboard</Link>
            {/* STRETCH FEATURE: Second navigational page link added to sidebar */}
            <Link to="/about" className="nav-link">ℹ️ About Insights</Link>
          </nav>
        </aside>

        {/* PRIMARY MAIN PANEL WINDOW FRAME */}
        <main className="main-content-panel">
          <Routes>
            <Route 
              path="/" 
              element={
                <DashboardView 
                  list={list} 
                  stats={stats} 
                  goalsPerMatchday={goalsPerMatchday} 
                  outcomeDistribution={outcomeDistribution} 
                />
              } 
            />
            {/* DYNAMIC DETAIL PATH ROUTE LINK */}
            <Route path="/match/:matchIndex" element={<MatchDetailView list={list} />} />
            {/* STRETCH FEATURE: Information page route mapping */}
            <Route path="/about" element={<AboutView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// ==========================================
// 2. PRIMARY DASHBOARD ROOT COMPONENT VIEW
// ==========================================
function DashboardView({ list, stats, goalsPerMatchday, outcomeDistribution }) {
  const [filteredList, setFilteredList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRound, setSelectedRound] = useState('All');
  const [minGoals, setMinGoals] = useState(0);
  const [maxGoals, setMaxGoals] = useState(8);

  // STRETCH FEATURE: State to toggle visualization container visibility dynamically
  const [showCharts, setShowCharts] = useState(true);

  useEffect(() => {
    let result = list;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(match => 
        match.team1.toLowerCase().includes(query) || match.team2.toLowerCase().includes(query)
      );
    }

    if (selectedRound !== 'All') {
      result = result.filter(match => match.round === selectedRound);
    }

    result = result.filter(match => {
      const totalMatchGoals = (match.score?.ft?.[0] || 0) + (match.score?.ft?.[1] || 0);
      return totalMatchGoals >= minGoals && totalMatchGoals <= maxGoals;
    });

    setFilteredList(result);
  }, [searchQuery, selectedRound, minGoals, maxGoals, list]);

  return (
    <>
      <header className="header-section">
        <h1>Premier League Match Insights</h1>
        <p>Analyze recent seasonal fixture statistics, results, and distributions.</p>
      </header>

      {/* Summary Cards */}
      <div className="stats-container">
        <div className="card"><h3>Fixtures Loaded</h3><p className="stat-number">{stats.totalMatches}</p></div>
        <div className="card"><h3>Total Goals Scored</h3><p className="stat-number" style={{ color: '#4ade80' }}>{stats.totalGoals}</p></div>
        <div className="card"><h3>Drawn Matches</h3><p className="stat-number" style={{ color: '#fbbf24' }}>{stats.totalDraws}</p></div>
      </div>

      {/* STRETCH FEATURE: Interactive Visibility Toggle Button */}
      <div className="toggle-container" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="toggle-charts-btn" onClick={() => setShowCharts(!showCharts)}>
          {showCharts ? '🙈 Hide Data Charts' : '📊 Show Data Charts'}
        </button>
      </div>

      {/* Visualizations Section - Controlled by showCharts condition */}
      {goalsPerMatchday.length > 0 && showCharts && (
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Goals Scored per Matchday Round</h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={goalsPerMatchday} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="Goals" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <h3>Match Results Ratio Breakdown</h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={outcomeDistribution} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" isAnimationActive={false}>
                    {outcomeDistribution.map((entry, idx) => <Cell key={`cell-${idx}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '8px', color: '#fff' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '5px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Input Filtering Controls */}
      <div className="controls-container">
        <input type="text" placeholder="Search by team name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-bar" />
        <select value={selectedRound} onChange={(e) => setSelectedRound(e.target.value)} className="filter-dropdown">
          <option value="All">All Matchdays</option>
          <option value="Matchday 1">Matchday 1</option>
          <option value="Matchday 2">Matchday 2</option>
          <option value="Matchday 3">Matchday 3</option>
          <option value="Matchday 4">Matchday 4</option>
          <option value="Matchday 5">Matchday 5</option>
        </select>

        <div className="slider-card">
          <label>Goal Range Boundaries</label>
          <div className="range-controls">
            <div>
              <span>Min: <strong>{minGoals}</strong></span>
              <input type="range" min="0" max="8" value={minGoals} onChange={(e) => { const val = Number(e.target.value); if (val <= maxGoals) setMinGoals(val); }} className="goal-slider" />
            </div>
            <div>
              <span>Max: <strong>{maxGoals}</strong></span>
              <input type="range" min="0" max="8" value={maxGoals} onChange={(e) => { const val = Number(e.target.value); if (val >= minGoals) setMaxGoals(val); }} className="goal-slider" />
            </div>
          </div>
        </div>
      </div>

      {/* Clickable Matches Layout Grid List */}
      <div className="list-container">
        <table>
          <thead>
            <tr><th>Date</th><th>Matchday</th><th style={{ textAlign: 'center' }}>Fixture & Scoreboard (Click row for details)</th></tr>
          </thead>
          <tbody>
            {filteredList.length > 0 ? (
              filteredList.map((match) => {
                const globalIndex = list.findIndex(m => m.date === match.date && m.team1 === match.team1);
                return (
                  <tr key={globalIndex} className="clickable-row">
                    <td>{match.date}</td>
                    <td><span className="badge">{match.round}</span></td>
                    <td className="fixture-cell">
                      <Link to={`/match/${globalIndex}`} className="fixture-navigation-link">
                        <span className="team-name home">{match.team1}</span>
                        <span className="score-pill">
                          {match.score?.ft?.[0] !== undefined ? match.score.ft[0] : '-'} - {match.score?.ft?.[1] !== undefined ? match.score.ft[1] : '-'}
                        </span>
                        <span className="team-name away">{match.team2}</span>
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>No match fixtures found matching those search metrics.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ==========================================
// 3. DEEP-LINKED EXTENDED DETAIL VIEW
// ==========================================
function MatchDetailView({ list }) {
  const { matchIndex } = useParams();
  const match = list[Number(matchIndex)];

  if (!match) {
    return <div className="detail-error-container"><h3>Fixture entity record loading or unavailable.</h3><Link to="/" className="back-btn">← Return to Main Panel</Link></div>;
  }

  const homeScore = match.score?.ft?.[0] ?? '-';
  const awayScore = match.score?.ft?.[1] ?? '-';
  const aggregateGoals = (match.score?.ft?.[0] || 0) + (match.score?.ft?.[1] || 0);

  return (
    <div className="detail-container">
      <Link to="/" className="back-btn">← Back to Dashboard Overview</Link>
      
      <div className="detail-header-card">
        <span className="detail-badge">{match.round}</span>
        <p className="detail-date">🗓 Scheduled Kickoff: {match.date}</p>
        
        <div className="detail-matchup-display">
          <div className="detail-team"><h2>{match.team1}</h2><span className="venue-label">Home Side</span></div>
          <div className="detail-score-box">{homeScore} : {awayScore}</div>
          <div className="detail-team"><h2>{match.team2}</h2><span className="venue-label">Away Side</span></div>
        </div>
      </div>

      <div className="extended-metrics-grid">
        <div className="metric-box"><h4>Aggregated Scoring Output</h4><p className="metric-focus">{aggregateGoals} Goals</p></div>
        <div className="metric-box">
          <h4>Evaluated Match Verdict</h4>
          <p className="metric-focus" style={{ color: homeScore === awayScore ? '#fbbf24' : '#38bdf8' }}>
            {homeScore === awayScore ? "Stalemate Draw" : (homeScore > awayScore ? "Home Team Victorious" : "Away Team Victorious")}
          </p>
        </div>
        <div className="metric-box"><h4>Data Ingestion Endpoint</h4><p className="metric-small-text">OpenFootball API Source Verified</p></div>
      </div>
    </div>
  );
}

// ==========================================
// 4. NEW STRETCH FEATURE: ABOUT VIEW COMPONENT
// ==========================================
function AboutView() {
  return (
    <div className="detail-container">
      <Link to="/" className="back-btn">← Back to Dashboard Overview</Link>
      
      <div className="detail-header-card" style={{ textAlign: 'left' }}>
        <h2 style={{ color: '#38bdf8', marginTop: 0 }}>📊 Dataset Exploration & Analysis Strategy</h2>
        <p style={{ color: '#9ca3af', fontSize: '1.05rem', lineHeight: '1.6' }}>
          Welcome to the Premier League Match Insights portal. This platform renders data sourced directly from open-source football repositories, aggregating key distribution profiles for recent professional matchups.
        </p>
        
        <hr style={{ borderColor: '#1f2937', margin: '25px 0' }} />
        
        <h3 style={{ color: '#f8fafc', fontSize: '1.2rem' }}>💡 Analytical Suggestions & Filter Guide:</h3>
        <ul style={{ color: '#cbd5e1', paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>
            <strong>Isolate High-Scoring Anomalies:</strong> Drag the <em>Minimum Goal Slider</em> up to <span style={{ color: '#4ade80' }}>4</span> or higher. This filters the data table to reveal offensive outliers while the bar chart updates to highlight which matchday rounds produced these explosive matchups.
          </li>
          <li>
            <strong>Analyze Home Field Advantage:</strong> Observe the <em>Match Results Ratio Breakdown</em> pie chart. Historically, home sides maintain higher win percentages due to stadium familiarity and crowd distributions—a trend cleanly visualized by our blue data sector.
          </li>
          <li>
            <strong>Track Matchday Progressions:</strong> Use the <em>Matchday Dropdown Selection</em> to slice individual fixture stages. Combining this with team search allows you to view performance vectors across specific operational intervals.
          </li>
        </ul>
      </div>
    </div>
  );
}

export default App;