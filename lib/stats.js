const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const statsFile = path.join(dataDir, 'stats.json');
const STATS_TIME_ZONE = 'Asia/Jakarta';

if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (e) {
    console.error('Failed to create data directory:', e);
  }
}

function getTodayDateString() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: STATS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

const defaultStats = {
  totalPremium: 0,
  todayPremium: 0,
  lastDate: getTodayDateString()
};

function saveStats(statsObj) {
  try {
    fs.writeFileSync(statsFile, JSON.stringify(statsObj, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing stats.json:', err);
  }
}

function loadStats() {
  try {
    if (fs.existsSync(statsFile)) {
      const raw = fs.readFileSync(statsFile, 'utf8');
      const data = JSON.parse(raw);
      const today = getTodayDateString();

      // Reset only the daily counter when the WIB date changes.
      if (data.lastDate !== today) {
        data.todayPremium = 0;
        data.lastDate = today;
        saveStats(data);
      }

      return data;
    }
  } catch (err) {
    console.error('Error reading stats.json, initializing defaults:', err);
  }

  saveStats(defaultStats);
  return { ...defaultStats };
}

function getStats() {
  const current = loadStats();
  return {
    total: current.totalPremium || 0,
    today: current.todayPremium || 0
  };
}

function incrementStats() {
  const current = loadStats();
  current.totalPremium = (current.totalPremium || 0) + 1;
  current.todayPremium = (current.todayPremium || 0) + 1;
  current.lastDate = getTodayDateString();
  saveStats(current);

  return {
    total: current.totalPremium,
    today: current.todayPremium
  };
}

module.exports = {
  getStats,
  incrementStats
};
