const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const statsFile = path.join(dataDir, 'stats.json');

// Statistik memakai tanggal WIB (Asia/Jakarta), bukan UTC.
function getTodayDateString() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

function emptyStats() {
  return {
    totalPremium: 0,
    todayPremium: 0,
    lastDate: getTodayDateString()
  };
}

function normalizeStats(data) {
  const totalPremium = Number.isFinite(Number(data?.totalPremium))
    ? Math.max(0, Number(data.totalPremium))
    : 0;
  const todayPremium = Number.isFinite(Number(data?.todayPremium))
    ? Math.max(0, Number(data.todayPremium))
    : 0;

  return {
    totalPremium,
    todayPremium,
    lastDate: typeof data?.lastDate === 'string' ? data.lastDate : getTodayDateString()
  };
}

function ensureDataDir() {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    return true;
  } catch (err) {
    console.error('Failed to create data directory:', err);
    return false;
  }
}

function saveStats(statsObj) {
  if (!ensureDataDir()) return false;

  const tmpFile = `${statsFile}.tmp`;
  try {
    fs.writeFileSync(tmpFile, JSON.stringify(statsObj, null, 2) + '\n', 'utf8');
    fs.renameSync(tmpFile, statsFile);
    return true;
  } catch (err) {
    try {
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    } catch (_) {}
    console.error('Error writing stats.json:', err);
    return false;
  }
}

function loadStats() {
  let data;

  try {
    if (fs.existsSync(statsFile)) {
      data = normalizeStats(JSON.parse(fs.readFileSync(statsFile, 'utf8')));
    } else {
      data = emptyStats();
    }
  } catch (err) {
    console.error('Error reading stats.json:', err);
    data = emptyStats();
  }

  const today = getTodayDateString();

  // Reset Today hanya ketika hari WIB benar-benar berganti.
  if (data.lastDate !== today) {
    data.todayPremium = 0;
    data.lastDate = today;
    saveStats(data);
  }

  return data;
}

function getStats() {
  const current = loadStats();
  return {
    total: current.totalPremium,
    today: current.todayPremium
  };
}

function incrementStats() {
  const current = loadStats();

  current.totalPremium += 1;
  current.todayPremium += 1;
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
