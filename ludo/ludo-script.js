// Sound Effects Synthesizer using Web Audio API
class LudoAudio {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  play(soundName) {
    if (this.isMuted) return;
    this.init();

    switch (soundName) {
      case 'click':
        this.playClick();
        break;
      case 'diceRoll':
        this.playDiceRoll();
        break;
      case 'sixRolled':
        this.playSixRolled();
        break;
      case 'tokenMove':
        this.playTokenMove();
        break;
      case 'tokenCapture':
        this.playTokenCapture();
        break;
      case 'tokenHome':
        this.playTokenHome();
        break;
      case 'playerJoin':
        this.playPlayerJoin();
        break;
      case 'playerLeave':
        this.playPlayerLeave();
        break;
      case 'victory':
        this.playVictory();
        break;
      case 'defeat':
        this.playDefeat();
        break;
    }
  }

  playClick() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playDiceRoll() {
    const rolls = 6;
    for (let i = 0; i < rolls; i++) {
      setTimeout(() => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';

        const freq = 180 + Math.random() * 120;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.04);
      }, i * 45);
    }
  }

  playSixRolled() {
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + index * 0.06);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime + index * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + index * 0.06 + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + index * 0.06);
      osc.stop(this.ctx.currentTime + index * 0.06 + 0.12);
    });
  }

  playTokenMove() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  playTokenCapture() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';

    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
  }

  playTokenHome() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + index * 0.07);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + index * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + index * 0.07 + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + index * 0.07);
      osc.stop(this.ctx.currentTime + index * 0.07 + 0.18);
    });
  }

  playPlayerJoin() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playPlayerLeave() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(250, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playVictory() {
    const melody = [
      { f: 523.25, d: 0.12 },
      { f: 659.25, d: 0.12 },
      { f: 783.99, d: 0.12 },
      { f: 1046.50, d: 0.35 }
    ];
    let time = this.ctx.currentTime;
    melody.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, time);

      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(time);
      osc.stop(time + note.d);
      time += note.d * 0.9;
    });
  }

  playDefeat() {
    const notes = [300, 260, 220, 180];
    let time = this.ctx.currentTime;
    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.2, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(time);
      osc.stop(time + 0.18);
      time += 0.16;
    });
  }
}

// Global audio instance & auto-unlock on initial gesture
const audio = new LudoAudio();
window.addEventListener('click', () => audio.init(), { once: true });
window.addEventListener('touchstart', () => audio.init(), { once: true });


// Game Configuration & State
const MAX_PLAYERS = 4; // Set your required total player count
let players = []; // Array tracking joined players
let isGameStarted = false;

const rollDiceBtn = document.getElementById('roll-dice-btn');
const statusText = document.getElementById('status-text');

// Function called whenever a player joins or leaves
function updateRoomState(joinedPlayers) {
  players = joinedPlayers;

  if (players.length === MAX_PLAYERS) {
    isGameStarted = true;
    rollDiceBtn.disabled = false; // Enable dice roll
    statusText.innerText = "All players joined! It's time to roll.";
  } else {
    isGameStarted = false;
    rollDiceBtn.disabled = true; // Disable dice roll
    statusText.innerText = `Waiting for players... (${players.length}/${MAX_PLAYERS})`;
  }
}



function triggerHaptic(type = 15) {
  if (navigator.vibrate) {
    navigator.vibrate(type);
  }
}

// Inject Victory Modal Styles & HTML Dynamically
(function injectVictoryModalUI() {
  const style = document.createElement('style');
  style.innerHTML = `
    .victory-modal-overlay {
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(8px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    .victory-modal-overlay.active {
      opacity: 1;
      pointer-events: auto;
    }
    .victory-modal-card {
      background: #1e293b;
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 28px 24px;
      width: 90%;
      max-width: 360px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      transform: scale(0.8);
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .victory-modal-overlay.active .victory-modal-card {
      transform: scale(1);
    }
    .victory-trophy {
      font-size: 56px;
      margin-bottom: 12px;
      filter: drop-shadow(0 0 12px rgba(234, 179, 8, 0.5));
      animation: trophyBounce 1s infinite alternate ease-in-out;
    }
    @keyframes trophyBounce {
      0% { transform: translateY(0); }
      100% { transform: translateY(-8px); }
    }
    .victory-title {
      font-size: 22px;
      font-weight: 800;
      color: #f8fafc;
      margin: 0 0 6px 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .victory-sub {
      font-size: 14px;
      color: #94a3b8;
      margin-bottom: 24px;
    }
    .victory-btn-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .victory-btn {
      width: 100%;
      padding: 12px 16px;
      border-radius: 12px;
      border: none;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: transform 0.15s ease, filter 0.15s ease;
    }
    .victory-btn:active {
      transform: scale(0.97);
    }
    .victory-btn-restart {
      background: #3b82f6;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
    }
    .victory-btn-home {
      background: #334155;
      color: #f8fafc;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
  `;
  document.head.appendChild(style);

  const modalHtml = `
    <div id="victory-modal" class="victory-modal-overlay">
      <div class="victory-modal-card">
        <div class="victory-trophy">🏆</div>
        <h2 id="victory-winner-text" class="victory-title">RED WINS!</h2>
        <p class="victory-sub">All tokens reached home safely.</p>
        <div class="victory-btn-group">
          <button class="victory-btn victory-btn-restart" onclick="restartMatch()">
            <span>🔄</span> Restart Match
          </button>
          <button class="victory-btn victory-btn-home" onclick="returnToHome()">
            <span>🏠</span> Main Menu
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
})();

const COMMON_PATH = [
  [6,1], [6,2], [6,3], [6,4], [6,5],
  [5,6], [4,6], [3,6], [2,6], [1,6], [0,6],
  [0,7], [0,8],
  [1,8], [2,8], [3,8], [4,8], [5,8],
  [6,9], [6,10], [6,11], [6,12], [6,13], [6,14],
  [7,14], [8,14],
  [8,13], [8,12], [8,11], [8,10], [8,9],
  [9,8], [10,8], [11,8], [12,8], [13,8], [14,8],
  [14,7], [14,6],
  [13,6], [12,6], [11,6], [10,6], [9,6],
  [8,5], [8,4], [8,3], [8,2], [8,1], [8,0],
  [7,0], [6,0]
];

const SAFE_SPOTS = [
  "6,1", "8,2", "1,8", "2,6", "8,13", "6,12", "13,6", "12,8"
];

const ALL_COLORS = ['red', 'green', 'yellow', 'blue'];

const PLAYER_CONFIG = {
  red: { startIndex: 0, homePath: [[7,1], [7,2], [7,3], [7,4], [7,5]], color: 'var(--red)' },
  green: { startIndex: 13, homePath: [[1,7], [2,7], [3,7], [4,7], [5,7]], color: 'var(--green)' },
  yellow: { startIndex: 26, homePath: [[7,13], [7,12], [7,11], [7,10], [7,9]], color: 'var(--yellow)' },
  blue: { startIndex: 39, homePath: [[13,7], [12,7], [11,7], [10,7], [9,7]], color: 'var(--blue)' }
};

// State Management
let matchMode = 'offline';
let onlineAction = 'create';
let roomToken = '';
let selectedPlayerCount = 2;
let selectedColor = 'red';
let activePlayers = [];

let turnIndex = 0;
let currentRoll = null;
let hasRolled = false;
let isRolling = false;
let isMoving = false;
let consecutiveSixes = 0;

let gameState = {};
const boardEl = document.getElementById('board');
const cellsMap = {};

// PeerJS WebRTC Connection Variables
let peer = null;
let peerConnections = [];
let hostConn = null;
let isHost = false;

function generateRoomToken() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let token = '';
  for (let i = 0; i < 5; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

function setMatchMode(mode) {
  audio.play('click');
  matchMode = mode;
  document.getElementById('mode-offline-btn').classList.toggle('active', mode === 'offline');
  document.getElementById('mode-online-btn').classList.toggle('active', mode === 'online');

  document.getElementById('offline-settings').style.display = mode === 'offline' ? 'block' : 'none';
  document.getElementById('online-settings').style.display = mode === 'online' ? 'flex' : 'none';

  if (mode === 'online') {
    setOnlineAction(onlineAction);
  }
}

function setOnlineAction(action) {
  audio.play('click');
  onlineAction = action;
  document.getElementById('online-create-btn').classList.toggle('active', action === 'create');
  document.getElementById('online-join-btn').classList.toggle('active', action === 'join');

  const roomInput = document.getElementById('room-code-input');
  const statusText = document.getElementById('room-status-text');
  const onlinePlayerOpt = document.getElementById('online-player-select');

  if (action === 'join') {
    roomInput.style.display = 'block';
    if (onlinePlayerOpt) onlinePlayerOpt.style.display = 'none';
    statusText.innerText = "Enter room code & click Join";
  } else {
    roomInput.style.display = 'none';
    if (onlinePlayerOpt) onlinePlayerOpt.style.display = 'block';
    statusText.innerText = `Click Start to generate 5-Digit Room Token (${selectedPlayerCount} Players)`;
  }
}

function selectPlayerCount(count) {
  audio.play('click');
  selectedPlayerCount = count;
  
  document.querySelectorAll('.player-opt-grid .opt-btn, .online-player-opt-grid .opt-btn').forEach(btn => {
    const btnCount = parseInt(btn.dataset.count || btn.innerText);
    btn.classList.toggle('active', btnCount === count);
  });

  if (matchMode === 'online' && onlineAction === 'create') {
    const statusText = document.getElementById('room-status-text');
    if (statusText) {
      statusText.innerText = `Click Start to generate 5-Digit Room Token (${selectedPlayerCount} Players)`;
    }
  }
}

function selectUserColor(color) {
  audio.play('click');
  selectedColor = color;
  document.querySelectorAll('.color-opt-grid .color-btn').forEach(btn => {
    btn.classList.toggle('active', btn.classList.contains(color));
  });
}

function startGame() {
  audio.play('click');
  triggerHaptic(30);

  if (matchMode === 'online') {
    initOnlineRoom();
  } else {
    initOfflineGame();
  }
}

function showPlayerExitModal(playerColor) {
  audio.play('playerLeave');
  triggerHaptic([30, 50, 30]);

  const modal = document.getElementById('exit-modal');
  if (!modal) return;

  const titleEl = document.getElementById('exit-modal-title');
  const descEl = document.getElementById('exit-modal-desc');
  const ringEl = document.getElementById('exit-avatar-ring');

  const colorHex = PLAYER_CONFIG[playerColor]?.color || '#f43f5e';

  if (titleEl) titleEl.innerText = `${playerColor.toUpperCase()} Left`;
  if (descEl) descEl.innerText = `Player ${playerColor.toUpperCase()} has disconnected from the room.`;

  if (ringEl) {
    ringEl.style.borderColor = colorHex;
    ringEl.style.boxShadow = `0 0 15px ${colorHex}`;
  }

  modal.classList.remove('hidden');
}

function closeExitModal() {
  audio.play('click');
  const modal = document.getElementById('exit-modal');
  if (modal) modal.classList.add('hidden');
}

function showVictoryModal(winnerColor) {
  audio.play('victory');
  triggerHaptic([40, 80, 40, 80, 100]);

  const modal = document.getElementById('victory-modal');
  const titleEl = document.getElementById('victory-winner-text');

  if (titleEl) {
    titleEl.innerText = `${winnerColor.toUpperCase()} HAS WON! 🎉`;
    titleEl.style.color = PLAYER_CONFIG[winnerColor]?.color || '#3b82f6';
  }

  if (modal) modal.classList.add('active');
}

function hideVictoryModal() {
  const modal = document.getElementById('victory-modal');
  if (modal) modal.classList.remove('active');
}

function restartMatch() {
  audio.play('click');
  hideVictoryModal();

  activePlayers.forEach(c => {
    gameState[c] = [-1, -1, -1, -1];
  });

  turnIndex = 0;
  resetTurnState();
  renderTokens();
  updateTurnUI();
  addMessageToChat("System", "Match Restarted!", 'left');

  if (matchMode === 'online') {
    broadcastData({
      type: 'RESTART_MATCH',
      gameState: gameState,
      turnIndex: turnIndex
    });
  }
}

function returnToHome() {
  audio.play('click');
  hideVictoryModal();

  if (peer) {
    peer.destroy();
    peer = null;
  }
  peerConnections = [];
  hostConn = null;

  document.getElementById('setup-modal').classList.remove('hidden');
  document.getElementById('room-tag').style.display = 'none';
}

function initOfflineGame() {
  const userIndex = ALL_COLORS.indexOf(selectedColor);
  activePlayers = [];

  if (selectedPlayerCount === 2) {
    activePlayers.push(ALL_COLORS[userIndex]);
    activePlayers.push(ALL_COLORS[(userIndex + 2) % 4]);
  } else if (selectedPlayerCount === 3) {
    activePlayers.push(ALL_COLORS[userIndex]);
    activePlayers.push(ALL_COLORS[(userIndex + 1) % 4]);
    activePlayers.push(ALL_COLORS[(userIndex + 2) % 4]);
  } else {
    activePlayers = [...ALL_COLORS];
  }

  gameState = {};
  ALL_COLORS.forEach(c => {
    if (activePlayers.includes(c)) {
      gameState[c] = [-1, -1, -1, -1];
    }
  });

  setupPlayerCards();
  turnIndex = 0;
  document.getElementById('room-tag').style.display = 'none';
  document.getElementById('setup-modal').classList.add('hidden');
  renderTokens();
  updateTurnUI();
  addMessageToChat("System", "Offline Match Started!", 'left');
}

function initOnlineRoom() {
  const statusText = document.getElementById('room-status-text');

  if (onlineAction === 'create') {
    roomToken = generateRoomToken();
    isHost = true;
    statusText.innerText = "Creating Room WebRTC Peer...";

    peer = new Peer('LUDO-' + roomToken);

    peer.on('open', (id) => {
      statusText.innerText = `Room Token: ${roomToken}. Waiting for players (1/${selectedPlayerCount})...`;
      document.getElementById('room-tag').style.display = 'block';
      document.getElementById('room-tag').innerText = `ROOM: ${roomToken}`;

      activePlayers = [selectedColor];
      gameState = {};
      gameState[selectedColor] = [-1, -1, -1, -1];

      setupPlayerCards();
      document.getElementById('setup-modal').classList.add('hidden');
      renderTokens();
      updateTurnUI();
      addMessageToChat("System", `Created ${selectedPlayerCount}-Player Room ${roomToken}. Share code with friends!`, 'left');
    });

    peer.on('connection', (conn) => {
      peerConnections.push(conn);
      conn.on('data', (data) => handleNetworkData(data, conn));

      conn.on('close', () => {
        const leftColor = conn.playerColor;
        if (leftColor) {
          activePlayers = activePlayers.filter(c => c !== leftColor);
          delete gameState[leftColor];

          setupPlayerCards();
          renderTokens();
          updateTurnUI();

          showPlayerExitModal(leftColor);
          addMessageToChat("System", `Player ${leftColor.toUpperCase()} left the game.`, 'left');

          broadcastData({
            type: 'PLAYER_LEFT',
            leftPlayer: leftColor,
            activePlayers: activePlayers
          });
        }
      });
    });

    peer.on('error', (err) => {
      statusText.innerText = "Room Token busy. Try starting again.";
    });

  } else {
    const inputVal = document.getElementById('room-code-input').value.trim().toUpperCase();
    if (inputVal.length !== 5) {
      alert('Please enter a valid 5-character Room Token.');
      return;
    }
    roomToken = inputVal;
    isHost = false;

    statusText.innerText = "Connecting to Host...";
    peer = new Peer();

    peer.on('open', (id) => {
      hostConn = peer.connect('LUDO-' + roomToken);

      hostConn.on('open', () => {
        document.getElementById('room-tag').style.display = 'block';
        document.getElementById('room-tag').innerText = `ROOM: ${roomToken}`;
        document.getElementById('setup-modal').classList.add('hidden');

        hostConn.send({
          type: 'JOIN_ROOM',
          color: selectedColor
        });
      });

      hostConn.on('data', (data) => handleNetworkData(data, hostConn));

      hostConn.on('close', () => {
        showPlayerExitModal('HOST');
        addMessageToChat("System", "Host disconnected from room.", 'left');
      });
    });

    peer.on('error', (err) => {
      statusText.innerText = "Could not find Room Code. Check code and try again.";
    });
  }
}

function broadcastData(data) {
  if (isHost) {
    peerConnections.forEach(conn => {
      if (conn.open) conn.send(data);
    });
  } else if (hostConn && hostConn.open) {
    hostConn.send(data);
  }
}

function handleNetworkData(data, senderConn) {
  if (data.type === 'JOIN_ROOM') {
    if (isHost) {
      if (activePlayers.length >= selectedPlayerCount) {
        senderConn.send({ type: 'ERROR', msg: 'Room is full!' });
        return;
      }

      let assignedColor = data.color;
      if (activePlayers.includes(assignedColor)) {
        assignedColor = ALL_COLORS.find(c => !activePlayers.includes(c));
      }

      if (!assignedColor) {
        senderConn.send({ type: 'ERROR', msg: 'Room is full!' });
        return;
      }

      senderConn.playerColor = assignedColor;
      activePlayers.push(assignedColor);
      gameState[assignedColor] = [-1, -1, -1, -1];

      senderConn.send({
        type: 'INIT_CLIENT',
        assignedColor: assignedColor,
        activePlayers: activePlayers,
        gameState: gameState,
        turnIndex: turnIndex,
        maxPlayers: selectedPlayerCount
      });

      setupPlayerCards();
      renderTokens();
      updateTurnUI();

      broadcastData({
        type: 'PLAYER_JOINED',
        activePlayers: activePlayers,
        gameState: gameState,
        newPlayer: assignedColor
      });

      audio.play('playerJoin');
      addMessageToChat("System", `Player joined as ${assignedColor.toUpperCase()}! (${activePlayers.length}/${selectedPlayerCount})`, 'left');
    }
  } else if (data.type === 'INIT_CLIENT') {
    selectedColor = data.assignedColor;
    activePlayers = data.activePlayers;
    gameState = data.gameState;
    turnIndex = data.turnIndex;
    selectedPlayerCount = data.maxPlayers || selectedPlayerCount;

    setupPlayerCards();
    renderTokens();
    updateTurnUI();
    audio.play('playerJoin');
    addMessageToChat("System", `Joined Room! You are playing as ${selectedColor.toUpperCase()} (${activePlayers.length}/${selectedPlayerCount})`, 'left');

  } else if (data.type === 'PLAYER_JOINED') {
    activePlayers = data.activePlayers;
    gameState = data.gameState;
    setupPlayerCards();
    renderTokens();
    updateTurnUI();
    audio.play('playerJoin');
    addMessageToChat("System", `Player joined as ${data.newPlayer.toUpperCase()}! (${activePlayers.length}/${selectedPlayerCount})`, 'left');

  } else if (data.type === 'PLAYER_LEFT') {
    activePlayers = data.activePlayers;
    if (data.leftPlayer) {
      delete gameState[data.leftPlayer];
      showPlayerExitModal(data.leftPlayer);
    }
    setupPlayerCards();
    renderTokens();
    updateTurnUI();
    addMessageToChat("System", `Player ${data.leftPlayer.toUpperCase()} left the game.`, 'left');

  } else if (data.type === 'ROLL_RESULT') {
    executeRemoteRoll(data.rollValue);

  } else if (data.type === 'MOVE_TOKEN') {
    executeRemoteMove(data.color, data.tokenIdx, data.targetPos);

  } else if (data.type === 'RESTART_MATCH') {
    gameState = data.gameState;
    turnIndex = data.turnIndex;
    hideVictoryModal();
    resetTurnState();
    renderTokens();
    updateTurnUI();
    addMessageToChat("System", "Match Restarted by Host!", 'left');

  } else if (data.type === 'CHAT_MSG') {
    addMessageToChat(data.sender, data.text, 'left');

  } else if (data.type === 'ERROR') {
    alert(data.msg);
    audio.play('playerLeave');
  }
}

function setupPlayerCards() {
  ALL_COLORS.forEach(color => {
    const card = document.getElementById(`card-${color}`);
    const home = document.getElementById(`home-${color}`);

    if (activePlayers.includes(color)) {
      if (card) card.classList.remove('disabled');
      if (home) home.classList.remove('disabled-home');
    } else {
      if (card) card.classList.add('disabled');
      if (home) home.classList.add('disabled-home');
    }
  });
}

function initializeBoard() {
  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      if ((r < 6 && c < 6) || (r < 6 && c > 8) || 
          (r > 8 && c < 6) || (r > 8 && c > 8) || 
          (r >= 6 && r <= 8 && c >= 6 && c <= 8)) {
        continue;
      }

      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.style.gridRowStart = r + 1;
      cell.style.gridColumnStart = c + 1;

      const key = `${r},${c}`;

      if (key === "6,1") cell.classList.add('start-red');
      if (key === "1,8") cell.classList.add('start-green');
      if (key === "8,13") cell.classList.add('start-yellow');
      if (key === "13,6") cell.classList.add('start-blue');

      if (r === 7 && c >= 1 && c <= 5) cell.classList.add('path-red');
      if (c === 7 && r >= 1 && r <= 5) cell.classList.add('path-green');
      if (r === 7 && c >= 9 && c <= 13) cell.classList.add('path-yellow');
      if (c === 7 && r >= 9 && r <= 13) cell.classList.add('path-blue');

      if (SAFE_SPOTS.includes(key)) cell.classList.add('safe-star');

      boardEl.appendChild(cell);
      cellsMap[key] = cell;
    }
  }

  ALL_COLORS.forEach(color => {
    const baseEl = document.getElementById(`base-${color}`);
    if (baseEl) {
      baseEl.innerHTML = '';
      for (let i = 0; i < 4; i++) {
        const spot = document.createElement('div');
        spot.className = 'base-spot';
        spot.id = `base-${color}-${i}`;
        baseEl.appendChild(spot);
      }
    }
  });

  renderDiceFace(6);
}

function renderDiceFace(value) {
  const diceEl = document.getElementById('dice');
  if (!diceEl) return;
  diceEl.innerHTML = '';

  const dotPatterns = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8]
  };

  const activeDots = dotPatterns[value] || [];

  for (let i = 0; i < 9; i++) {
    const pip = document.createElement('div');
    pip.className = 'pip' + (activeDots.includes(i) ? ' active' : '');
    diceEl.appendChild(pip);
  }
}

function renderTokens(activeMovingTokenKey = null) {
  document.querySelectorAll('.token').forEach(t => t.remove());

  activePlayers.forEach(color => {
    gameState[color].forEach((pos, idx) => {
      const token = document.createElement('div');
      token.className = `token ${color}`;
      token.dataset.color = color;
      token.dataset.index = idx;

      const currentKey = `${color}-${idx}`;
      if (activeMovingTokenKey === currentKey) {
        token.classList.add('moving');
      }

      token.onclick = (e) => {
        e.stopPropagation();
        handleTokenClick(color, idx);
      };

      if (pos === -1) {
        const spot = document.getElementById(`base-${color}-${idx}`);
        if (spot) spot.appendChild(token);
      } else if (pos === 56) {
        const home = document.querySelector('.center-home');
        if (home) home.appendChild(token);
      } else {
        const coords = getCoordinates(color, pos);
        if (coords) {
          const cellKey = `${coords[0]},${coords[1]}`;
          if (cellsMap[cellKey]) {
            cellsMap[cellKey].appendChild(token);
          }
        }
      }
    });
  });
}

function getCoordinates(color, step) {
  if (step <= 50) {
    const globalIdx = (PLAYER_CONFIG[color].startIndex + step) % 52;
    return COMMON_PATH[globalIdx];
  } else if (step <= 55) {
    const homeStep = step - 51;
    return PLAYER_CONFIG[color].homePath[homeStep];
  } else {
    return null;
  }
}

function handleDiceClick() {
  if (matchMode === 'online' && activePlayers[turnIndex] !== selectedColor) {
    return;
  }
  rollDice();
}

function rollDice() {
  // Guard check: Prevent roll if active, moving, or waiting for online players
  if (hasRolled || isRolling || isMoving) return;
  if (matchMode === 'online' && !allPlayersJoined) {
    const hintEl = document.getElementById('dice-hint');
    if (hintEl) hintEl.innerText = "Waiting for all players to join...";
    return;
  }

  audio.play('diceRoll');
  triggerHaptic(20);
  isRolling = true;
  const diceBtn = document.getElementById('dice');
  const hintEl = document.getElementById('dice-hint');
  if (diceBtn) diceBtn.classList.add('rolling');
  if (hintEl) hintEl.innerText = "Rolling...";

  const rollValue = Math.floor(Math.random() * 6) + 1;

  let animCount = 0;
  const interval = setInterval(() => {
    renderDiceFace(Math.floor(Math.random() * 6) + 1);
    animCount++;
    if (animCount > 8) {
      clearInterval(interval);
      finishRoll(rollValue);

      if (matchMode === 'online') {
        broadcastData({
          type: 'ROLL_RESULT',
          rollValue: rollValue
        });
      }
    }
  }, 50);
}

function executeRemoteRoll(rollValue) {
  isRolling = true;
  audio.play('diceRoll');
  const diceBtn = document.getElementById('dice');
  const hintEl = document.getElementById('dice-hint');
  if (diceBtn) diceBtn.classList.add('rolling');
  if (hintEl) hintEl.innerText = "Remote Rolling...";

  let animCount = 0;
  const interval = setInterval(() => {
    renderDiceFace(Math.floor(Math.random() * 6) + 1);
    animCount++;
    if (animCount > 8) {
      clearInterval(interval);
      finishRoll(rollValue);
    }
  }, 50);
}



function finishRoll(rollValue) {
  const diceBtn = document.getElementById('dice');
  const hintEl = document.getElementById('dice-hint');
  if (diceBtn) diceBtn.classList.remove('rolling');

  currentRoll = rollValue;
  renderDiceFace(currentRoll);
  triggerHaptic(30);

  isRolling = false;
  hasRolled = true;

  if (currentRoll === 6) {
    audio.play('sixRolled');
    consecutiveSixes++;
  } else {
    consecutiveSixes = 0;
  }

  if (consecutiveSixes === 3) {
    consecutiveSixes = 0;
    if (hintEl) hintEl.innerText = "3 Sixes! Turn Lost";
    setTimeout(nextTurn, 1000);
    return;
  }

  if (!hasValidMoves(activePlayers[turnIndex], currentRoll)) {
    if (hintEl) hintEl.innerText = "No Valid Move!";
    setTimeout(nextTurn, 1000);
  } else {
    if (hintEl) hintEl.innerText = `Rolled ${currentRoll}! Select Token`;
    highlightMovableTokens(activePlayers[turnIndex], currentRoll);
  }
}

function hasValidMoves(color, roll) {
  return gameState[color].some((pos) => isValidMove(color, pos, roll));
}

function isValidMove(color, pos, roll) {
  if (pos === -1 && roll === 6) return true;
  if (pos >= 0 && pos + roll <= 56) return true;
  return false;
}

function highlightMovableTokens(color, roll) {
  if (matchMode === 'online' && color !== selectedColor) return;

  gameState[color].forEach((pos, idx) => {
    if (isValidMove(color, pos, roll)) {
      const tokenEl = document.querySelector(`.token.${color}[data-index='${idx}']`);
      if (tokenEl) tokenEl.classList.add('clickable');
    }
  });
}

function clearHighlights() {
  document.querySelectorAll('.token.clickable').forEach(t => t.classList.remove('clickable'));
}

function handleTokenClick(color, tokenIdx) {
  if (!hasRolled || isRolling || isMoving || activePlayers[turnIndex] !== color) return;
  if (matchMode === 'online' && color !== selectedColor) return;

  const currentPos = gameState[color][tokenIdx];
  if (!isValidMove(color, currentPos, currentRoll)) return;

  const targetPos = (currentPos === -1 && currentRoll === 6) ? 0 : currentPos + currentRoll;

  if (matchMode === 'online') {
    broadcastData({
      type: 'MOVE_TOKEN',
      color: color,
      tokenIdx: tokenIdx,
      targetPos: targetPos
    });
  }

  executeRemoteMove(color, tokenIdx, targetPos);
}

function executeRemoteMove(color, tokenIdx, targetPos) {
  isMoving = true;
  clearHighlights();

  const currentPos = gameState[color][tokenIdx];

  if (currentPos === -1) {
    gameState[color][tokenIdx] = 0;
    audio.play('tokenMove');
    triggerHaptic(20);
    renderTokens(`${color}-${tokenIdx}`);
    setTimeout(() => finalizeTokenStep(color, tokenIdx, targetPos), 200);
  } else {
    let stepCounter = currentPos + 1;

    const stepTimer = setInterval(() => {
      gameState[color][tokenIdx] = stepCounter;
      audio.play('tokenMove');
      triggerHaptic(10);
      renderTokens(`${color}-${tokenIdx}`);

      if (stepCounter >= targetPos) {
        clearInterval(stepTimer);
        finalizeTokenStep(color, tokenIdx, targetPos);
      }
      stepCounter++;
    }, 160);
  }
}

function finalizeTokenStep(color, tokenIdx, targetPos) {
  let extraTurnGrant = (currentRoll === 6) || (targetPos === 56);

  if (targetPos === 56) {
    addMessageToChat("Game", `${color.toUpperCase()} token reached Home! 🎉`, 'left');
    triggerHaptic([30, 50, 30, 50]);

    if (gameState[color].every(p => p === 56)) {
      addMessageToChat("System", `🏆 ${color.toUpperCase()} HAS WON THE GAME! 🎉`, 'left');
      showVictoryModal(color);
      isMoving = false;
      return;
    } else {
      audio.play('tokenHome');
    }
  } else if (targetPos <= 50) {
    const coords = getCoordinates(color, targetPos);
    if (coords) {
      const coordKey = `${coords[0]},${coords[1]}`;

      if (!SAFE_SPOTS.includes(coordKey)) {
        activePlayers.forEach(otherColor => {
          if (otherColor !== color) {
            gameState[otherColor].forEach((otherPos, otherIdx) => {
              if (otherPos >= 0 && otherPos <= 50) {
                const otherCoords = getCoordinates(otherColor, otherPos);
                if (otherCoords && otherCoords[0] === coords[0] && otherCoords[1] === coords[1]) {
                  gameState[otherColor][otherIdx] = -1;
                  extraTurnGrant = true;
                  audio.play('tokenCapture');
                  triggerHaptic([40, 60, 40]);
                  addMessageToChat("Game", `${color.toUpperCase()} captured ${otherColor.toUpperCase()}! 💥`, 'left');
                }
              }
            });
          }
        });
      }
    }
  }

  renderTokens();
  isMoving = false;

  if (extraTurnGrant) {
    resetTurnState();
    const hintEl = document.getElementById('dice-hint');
    if (hintEl) hintEl.innerText = "Bonus Turn! Roll Again";
    updateTurnUI();
  } else {
    nextTurn();
  }
}

function resetTurnState() {
  hasRolled = false;
}

function updateTurnUI() {
  const currentColor = activePlayers[turnIndex];
  if (!currentColor) return;

  const turnDot = document.getElementById('turn-dot');
  const turnText = document.getElementById('turn-text');
  
  if (turnDot) {
    turnDot.style.backgroundColor = PLAYER_CONFIG[currentColor].color;
    turnDot.style.boxShadow = `0 0 10px ${PLAYER_CONFIG[currentColor].color}`;
  }
  if (turnText) {
    turnText.innerText = `${currentColor.toUpperCase()}'S TURN`;
    turnText.style.color = PLAYER_CONFIG[currentColor].color;
  }

  document.querySelectorAll('.player-card').forEach(card => card.classList.remove('active'));
  const activeCard = document.getElementById(`card-${currentColor}`);
  if (activeCard) activeCard.classList.add('active');

  const diceBtn = document.getElementById('dice');
  const hintEl = document.getElementById('dice-hint');

  if (matchMode === 'online' && currentColor !== selectedColor) {
    if (diceBtn) diceBtn.classList.add('disabled-dice');
    if (hintEl) hintEl.innerText = `Waiting for ${currentColor.toUpperCase()}...`;
  } else {
    if (diceBtn) diceBtn.classList.remove('disabled-dice');
    if (hintEl) hintEl.innerText = "Tap Dice to Roll";
  }
}

function nextTurn() {
  resetTurnState();
  turnIndex = (turnIndex + 1) % activePlayers.length;
  updateTurnUI();
}

function toggleChat(open) {
  audio.play('click');
  const drawer = document.getElementById('chat-drawer');
  const badge = document.getElementById('unread-badge');
  if (drawer) {
    if (open) {
      drawer.classList.add('open');
      if (badge) badge.style.display = 'none';
    } else {
      drawer.classList.remove('open');
    }
  }
}

function sendQuickMessage(msg) {
  sendChatMessageText(msg);
}

function sendChatMessage() {
  const input = document.getElementById('chat-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  sendChatMessageText(text);
  input.value = '';
}
function sendChatMessageText(text) {
  audio.play('click');
  addMessageToChat("You", text, 'right');

  if (matchMode === 'online') {
    broadcastData({
      type: 'CHAT_MSG',
      sender: selectedColor.toUpperCase(),
      text: text
    });
  }
}

function addMessageToChat(sender, text, position) {
  const chatContainer = document.getElementById('chat-messages');
  if (!chatContainer) return;

  const bubble = document.createElement('div');
  bubble.className = `message-bubble ${position}`;

  const senderEl = document.createElement('div');
  senderEl.className = 'message-sender';
  senderEl.innerText = sender;

  const contentEl = document.createElement('div');
  contentEl.innerText = text;

  bubble.appendChild(senderEl);
  bubble.appendChild(contentEl);
  chatContainer.appendChild(bubble);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const drawer = document.getElementById('chat-drawer');
  const badge = document.getElementById('unread-badge');
  if (position === 'left' && drawer && !drawer.classList.contains('open')) {
    if (badge) badge.style.display = 'block';
  }
}

// Initialize Board on load
initializeBoard();