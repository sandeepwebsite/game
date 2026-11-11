/* =========================================================
   LUDO MULTIPLAYER
   Offline + Online PeerJS
   ========================================================= */

(() => {
"use strict";

/* ================= CONFIGURATION ================= */

const COLORS = ["red", "green", "yellow", "blue"];

const COLOR_NAMES = {
  red: "Red",
  green: "Green",
  yellow: "Yellow",
  blue: "Blue"
};

const COLOR_HEX = {
  red: "#ff3b30",
  green: "#34c759",
  yellow: "#ffcc00",
  blue: "#007aff"
};

const TOKENS_PER_PLAYER = 4;

const SAFE_CELLS = [0, 8, 13, 21, 26, 34, 39, 47];

/*
  Standard 52-cell Ludo track.
  Coordinates use 0-based row and column.
*/

const TRACK = [
  [6,1],[6,2],[6,3],[6,4],[6,5],
  [5,6],[4,6],[3,6],[2,6],[1,6],[0,6],
  [0,7],[0,8],
  [1,8],[2,8],[3,8],[4,8],[5,8],
  [6,9],[6,10],[6,11],[6,12],[6,13],[6,14],
  [7,14],[8,14],
  [8,13],[8,12],[8,11],[8,10],[8,9],
  [9,8],[10,8],[11,8],[12,8],[13,8],[14,8],
  [14,7],[14,6],
  [13,6],[12,6],[11,6],[10,6],[9,6],
  [8,5],[8,4],[8,3],[8,2],[8,1],[8,0],
  [7,0],[6,0]
];

/*
  Each color starts at a different position
  on the shared track.
*/

const START_INDEX = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39
};

/*
  Home lane coordinates.
*/

const HOME_LANES = {
  red: [
    [7,1],[7,2],[7,3],[7,4],[7,5],[7,6]
  ],

  green: [
    [1,7],[2,7],[3,7],[4,7],[5,7],[6,7]
  ],

  yellow: [
    [7,13],[7,12],[7,11],[7,10],[7,9],[7,8]
  ],

  blue: [
    [13,7],[12,7],[11,7],[10,7],[9,7],[8,7]
  ]
};

const BASE_COORDS = {
  red: [[2,2],[2,4],[4,2],[4,4]],
  green: [[2,10],[2,12],[4,10],[4,12]],
  yellow: [[10,10],[10,12],[12,10],[12,12]],
  blue: [[10,2],[10,4],[12,2],[12,4]]
};

/* ================= GAME STATE ================= */

let matchMode = "offline";
let onlineAction = "create";

let playerCount = 2;
let selectedColor = "red";

let players = [];
let currentTurn = 0;

let diceValue = 0;
let diceRolling = false;
let waitingForMove = false;

let gameStarted = false;
let gameOver = false;

let gameState = null;

let peer = null;
let connections = [];

let roomCode = "";
let isHost = false;
let myPeerId = null;

let myColor = null;
let hostConnection = null;

let chatOpen = false;
let unreadMessages = 0;

let audioContext = null;
let gameMessageTimer = null;

const $ = id => document.getElementById(id);

/* ================= AUDIO ================= */

function playSound(type = "click") {

  try {

    const AudioCtx =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioCtx) return;

    if (!audioContext) {
      audioContext = new AudioCtx();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    const now = audioContext.currentTime;

    const sounds = {
      click: [500, 0.06],
      dice: [650, 0.12],
      move: [420, 0.07],
      capture: [180, 0.25],
      win: [850, 0.5],
      message: [720, 0.08]
    };

    const [frequency, duration] =
      sounds[type] || sounds.click;

    oscillator.type = "sine";

    oscillator.frequency.setValueAtTime(
      frequency,
      now
    );

    if (type === "dice") {

      oscillator.frequency.exponentialRampToValueAtTime(
        220,
        now + duration
      );

    }

    if (type === "win") {

      oscillator.frequency.exponentialRampToValueAtTime(
        1400,
        now + duration
      );

    }

    gain.gain.setValueAtTime(0.001, now);

    gain.gain.exponentialRampToValueAtTime(
      0.12,
      now + 0.015
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      now + duration
    );

    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);

  } catch (error) {
    console.warn("Audio unavailable:", error);
  }
}

/* ================= SETUP FUNCTIONS ================= */

window.setMatchMode = function(mode) {

  matchMode = mode;

  $("mode-offline-btn").classList.toggle(
    "active",
    mode === "offline"
  );

  $("mode-online-btn").classList.toggle(
    "active",
    mode === "online"
  );

  $("offline-settings").style.display =
    mode === "offline" ? "block" : "none";

  $("online-settings").style.display =
    mode === "online" ? "flex" : "none";

  $("room-status-text").textContent =
    mode === "online"
      ? "Create a room or join an existing room"
      : "";

  updateStartButton();

};

window.setOnlineAction = function(action) {

  onlineAction = action;

  $("online-create-btn").classList.toggle(
    "active",
    action === "create"
  );

  $("online-join-btn").classList.toggle(
    "active",
    action === "join"
  );

  $("online-player-select").style.display =
    action === "create" ? "block" : "none";

  $("room-code-input").style.display =
    action === "join" ? "block" : "none";

  $("room-status-text").textContent =
    action === "create"
      ? "Create a new multiplayer room"
      : "Enter the five-digit room code";

  updateStartButton();

};

window.selectPlayerCount = function(count) {

  playerCount = count;

  document.querySelectorAll(
    '[data-count]'
  ).forEach(button => {

    const parent = button.parentElement;

    if (
      parent.classList.contains("player-opt-grid") ||
      parent.classList.contains("online-player-opt-grid")
    ) {

      button.classList.toggle(
        "active",
        Number(button.dataset.count) === count
      );

    }

  });

};

window.selectUserColor = function(color) {

  selectedColor = color;

  document.querySelectorAll(
    ".color-btn"
  ).forEach(button => {

    button.classList.toggle(
      "active",
      button.classList.contains(color)
    );

  });

};

function updateStartButton() {

  const button = $("start-btn");

  if (!button) return;

  const code = $("room-code-input").value.trim();

  button.disabled =
    matchMode === "online" &&
    onlineAction === "join" &&
    !/^\d{5}$/.test(code);

}

/* ================= ROOM CODE ================= */

function generateRoomCode() {

  return String(
    Math.floor(10000 + Math.random() * 90000)
  );

}

/* ================= BOARD CREATION ================= */

function createBoard() {

  const board = $("board");

  board.querySelectorAll(".cell").forEach(
    cell => cell.remove()
  );

  const reserved = new Set();

  /*
    Home areas.
  */

  for (let r = 0; r < 15; r++) {

    for (let c = 0; c < 15; c++) {

      const isHome =
        (r < 6 && c < 6) ||
        (r < 6 && c > 8) ||
        (r > 8 && c < 6) ||
        (r > 8 && c > 8);

      const isCenter =
        r >= 6 && r <= 8 &&
        c >= 6 && c <= 8;

      if (isHome || isCenter) {

        reserved.add(`${r},${c}`);

      }

    }

  }

  const trackMap = new Map();

  TRACK.forEach((position, index) => {
    trackMap.set(
      `${position[0]},${position[1]}`,
      index
    );
  });

  const laneMap = new Map();

  COLORS.forEach(color => {

    HOME_LANES[color].forEach(
      (position, index) => {

        laneMap.set(
          `${position[0]},${position[1]}`,
          { color, index }
        );

      }
    );

  });

  /*
    Build remaining board cells.
  */

  for (let r = 0; r < 15; r++) {

    for (let c = 0; c < 15; c++) {

      if (reserved.has(`${r},${c}`)) continue;

      const cell = document.createElement("div");

      cell.className = "cell";

      cell.id = `cell-${r}-${c}`;

      const trackIndex = trackMap.get(`${r},${c}`);

      const lane = laneMap.get(`${r},${c}`);

      if (trackIndex !== undefined) {

        const color = COLORS.find(
          item => START_INDEX[item] === trackIndex
        );

        if (color) {
          cell.classList.add(`start-${color}`);
        }

        if (SAFE_CELLS.includes(trackIndex)) {

          cell.classList.add("safe-star");

          addStar(cell);

        }

        cell.dataset.track = trackIndex;

      }

      if (lane) {

        cell.classList.add(`path-${lane.color}`);

        cell.dataset.lane = lane.color;

        cell.dataset.laneIndex = lane.index;

      }

      board.appendChild(cell);

    }

  }

  /*
    Create home base spots.
  */

  COLORS.forEach(color => {

    const base = $(`base-${color}`);

    if (!base) return;

    base.innerHTML = "";

    for (let i = 0; i < 4; i++) {

      const spot = document.createElement("div");

      spot.className = "base-spot";

      spot.id = `base-${color}-${i}`;

      base.appendChild(spot);

    }

  });

}

function addStar(cell) {

  const star = document.createElement("span");

  star.className = "safe-star-icon";

  star.textContent = "★";

  cell.appendChild(star);

}

/* ================= PLAYER SETUP ================= */

function createPlayers() {

  players = [];

  let order = [];

  if (matchMode === "offline") {

    order = COLORS.slice(0, playerCount);

  } else {

    order = [selectedColor];

  }

  order.forEach((color, index) => {

    players.push({

      color,

      name: COLOR_NAMES[color],

      peerId: null,

      connected: true,

      isLocal:
        matchMode === "offline" ||
        color === myColor,

      tokens: Array.from(
        { length: TOKENS_PER_PLAYER },
        () => ({
          position: -1,
          finished: false
        })
      )

    });

  });

  if (matchMode === "online" && isHost) {

    players = [];

    players.push(createPlayer(myColor));

  }

}

function createPlayer(color, peerId = null) {

  return {

    color,

    name: COLOR_NAMES[color],

    peerId,

    connected: true,

    isLocal: matchMode === "offline",

    tokens: Array.from(
      { length: 4 },
      () => ({
        position: -1,
        finished: false
      })
    )

  };

}

/* ================= START GAME ================= */

window.startGame = async function() {

  if (matchMode === "online") {

    if (onlineAction === "create") {

      await createOnlineRoom();

    } else {

      await joinOnlineRoom();

    }

    return;

  }

  playSound("click");

  myColor = null;

  isHost = false;

  createPlayers();

  initializeGame();

};

function initializeGame() {

  gameStarted = true;

  gameOver = false;

  currentTurn = 0;

  diceValue = 0;

  diceRolling = false;

  waitingForMove = false;

  gameState = null;

  createBoard();

  $("setup-modal").classList.add("hidden");

  $("room-tag").style.display = "none";

  updatePlayerCards();

  renderTokens();

  updateTurnDisplay();

  updateDiceDisplay(0);

  addSystemMessage(
    "Game started! Good luck everyone."
  );

}

/* ================= PLAYER CARDS ================= */

function updatePlayerCards() {

  COLORS.forEach(color => {

    const player = players.find(
      p => p.color === color
    );

    const card = $(`card-${color}`);

    const home = $(`home-${color}`);

    if (!player) {

      card.classList.add("disabled");

      home.classList.add("disabled-home");

      card.classList.remove("active");

      return;

    }

    card.classList.remove("disabled");

    home.classList.remove("disabled-home");

    $(`name-${color}`).textContent = player.name;

    card.classList.toggle(
      "active",
      players[currentTurn]?.color === color
    );

  });

}

/* ================= DICE ================= */

function createDicePips(value) {

  const patterns = {

    1: [4],

    2: [0,8],

    3: [0,4,8],

    4: [0,2,6,8],

    5: [0,2,4,6,8],

    6: [0,2,3,5,6,8]

  };

  const dice = $("dice");

  dice.innerHTML = "";

  for (let i = 0; i < 9; i++) {

    const pip = document.createElement("span");

    pip.className =
      patterns[value]?.includes(i)
        ? "pip active"
        : "pip";

    dice.appendChild(pip);

  }

}

function updateDiceDisplay(value) {

  createDicePips(value);

  const dice = $("dice");

  dice.classList.toggle(
    "disabled-dice",
    diceRolling || waitingForMove || !isMyTurn()
  );

}

function isMyTurn() {

  if (matchMode === "offline") return true;

  return players[currentTurn]?.color === myColor;

}

window.handleDiceClick = async function() {

  if (!gameStarted || gameOver) return;

  if (diceRolling || waitingForMove) return;

  if (!isMyTurn()) {

    showHint("Wait for your turn!");

    return;

  }

  diceRolling = true;

  updateDiceDisplay(1);

  $("dice").classList.add("rolling");

  $("dice-hint").textContent = "Rolling...";

  playSound("dice");

  let count = 0;

  const interval = setInterval(() => {

    createDicePips(
      Math.floor(Math.random() * 6) + 1
    );

    count++;

    if (count > 10) {

      clearInterval(interval);

      const result =
        Math.floor(Math.random() * 6) + 1;

      finishDiceRoll(result);

    }

  }, 75);

};

function finishDiceRoll(value) {

  diceRolling = false;

  diceValue = value;

  $("dice").classList.remove("rolling");

  createDicePips(value);

  $("dice-hint").textContent =
    `You rolled ${value}`;

  const player = players[currentTurn];

  if (!player) return;

  const possible = getMovableTokens(player);

  if (matchMode === "online" && isHost) {

    broadcast({
      type: "dice",
      value,
      currentTurn
    });

  }

  if (possible.length === 0) {

    waitingForMove = false;

    updateDiceDisplay(value);

    $("dice-hint").textContent =
      value === 6
        ? "No moves available"
        : "No move available";

    setTimeout(() => {

      if (value !== 6) {

        nextTurn();

      } else {

        resetDice();

      }

    }, 900);

    return;

  }

  waitingForMove = true;

  updateDiceDisplay(value);

  renderTokens();

  $("dice-hint").textContent =
    "Select a highlighted token";

}

/* ================= MOVEMENT ================= */

function getMovableTokens(player) {

  const result = [];

  player.tokens.forEach((token, index) => {

    if (token.finished) return;

    if (token.position === -1) {

      if (diceValue === 6) {
        result.push(index);
      }

      return;

    }

    if (token.position + diceValue <= 57) {

      result.push(index);

    }

  });

  return result;

}

function getGlobalPosition(color, progress) {

  if (progress < 0 || progress > 51) return null;

  return (
    START_INDEX[color] + progress
  ) % 52;

}

function getTokenLocation(color, token) {

  if (token.position === -1) {

    return {
      type: "base",
      index: token.index
    };

  }

  if (token.position >= 52) {

    const laneIndex = token.position - 52;

    return {
      type: "lane",
      index: laneIndex,
      color
    };

  }

  return {
    type: "track",
    index: getGlobalPosition(
      color,
      token.position
    )
  };

}

function tokenElement(color, index) {

  const token = document.createElement("div");

  token.className = `token ${color}`;

  token.dataset.color = color;

  token.dataset.index = index;

  token.title =
    `${COLOR_NAMES[color]} Token ${index + 1}`;

  token.addEventListener("click", () => {

    handleTokenClick(color, index);

  });

  return token;

}

/* ================= RENDER TOKENS ================= */

function renderTokens() {

  document.querySelectorAll(
    ".base-spot, .cell, .center-home"
  ).forEach(element => {

    element.querySelectorAll(".token").forEach(
      token => token.remove()
    );

  });

  const occupied = new Map();

  players.forEach(player => {

    player.tokens.forEach((token, index) => {

      if (token.finished) return;

      const position = token.position;

      let target;

      if (position === -1) {

        target = $(
          `base-${player.color}-${index}`
        );

      } else if (position >= 52) {

        const laneIndex = position - 52;

        const coords =
          HOME_LANES[player.color][laneIndex];

        target = $(
          `cell-${coords[0]}-${coords[1]}`
        );

      } else {

        const trackIndex = getGlobalPosition(
          player.color,
          position
        );

        const coords = TRACK[trackIndex];

        target = $(
          `cell-${coords[0]}-${coords[1]}`
        );

      }

      if (!target) return;

      const tokenElementNode = tokenElement(
        player.color,
        index
      );

      const movable =
        waitingForMove &&
        isMyTurn() &&
        getMovableTokens(player).includes(index);

      if (movable) {

        tokenElementNode.classList.add("clickable");

      }

      target.appendChild(tokenElementNode);

      const key =
        `${player.color}-${position}`;

      occupied.set(
        key,
        (occupied.get(key) || 0) + 1
      );

    });

  });

}

/* ================= TOKEN CLICK ================= */

async function handleTokenClick(color, index) {

  if (!gameStarted || gameOver) return;

  if (!waitingForMove) return;

  const player = players[currentTurn];

  if (!player || player.color !== color) return;

  if (!isMyTurn()) return;

  const movable = getMovableTokens(player);

  if (!movable.includes(index)) return;

  playSound("move");

  await moveToken(currentTurn, index);

}

async function moveToken(playerIndex, tokenIndex) {

  const player = players[playerIndex];

  const token = player.tokens[tokenIndex];

  if (!player || !token) return;

  waitingForMove = false;

  const dice = diceValue;

  let oldPosition = token.position;

  let newPosition;

  if (oldPosition === -1) {

    newPosition = 0;

  } else {

    newPosition = oldPosition + dice;

  }

  /*
    Animate token one step at a time.
  */

  if (oldPosition === -1) {

    token.position = 0;

    renderTokens();

    await delay(180);

  } else {

    for (
      let step = oldPosition + 1;
      step <= newPosition;
      step++
    ) {

      token.position = step;

      renderTokens();

      await delay(115);

    }

  }

  /*
    Reaching the final home position.
  */

  if (newPosition === 57) {

    token.finished = true;

    playSound("win");

  }

  /*
    Capture opponents.
  */

  let captured = false;

  if (
    newPosition <= 51 &&
    !SAFE_CELLS.includes(
      getGlobalPosition(player.color, newPosition)
    )
  ) {

    const globalPosition =
      getGlobalPosition(player.color, newPosition);

    players.forEach((opponent, opponentIndex) => {

      if (opponentIndex === playerIndex) return;

      opponent.tokens.forEach(opponentToken => {

        if (opponentToken.finished) return;

        if (opponentToken.position < 0 ||
            opponentToken.position > 51) return;

        const opponentPosition =
          getGlobalPosition(
            opponent.color,
            opponentToken.position
          );

        if (opponentPosition === globalPosition) {

          opponentToken.position = -1;

          captured = true;

        }

      });

    });

  }

  renderTokens();

  if (captured) {

    playSound("capture");

    showHint("Opponent captured!");

  }

  /*
    Synchronize online state.
  */

  if (matchMode === "online" && isHost) {

    broadcast({
      type: "state",
      state: serializeGame()
    });

  }

  /*
    Check winner.
  */

  if (
    player.tokens.every(token => token.finished)
  ) {

    finishGame(player);

    return;

  }

  /*
    Six or capture gives an extra turn.
  */

  if (dice === 6 || captured) {

    resetDice();

    $("dice-hint").textContent =
      captured
        ? "Capture! Roll again"
        : "Six! Roll again";

  } else {

    nextTurn();

  }

}

/* ================= TURN MANAGEMENT ================= */

function nextTurn() {

  currentTurn++;

  if (currentTurn >= players.length) {

    currentTurn = 0;

  }

  resetDice();

  updatePlayerCards();

  updateTurnDisplay();

  renderTokens();

  if (matchMode === "online" && isHost) {

    broadcast({
      type: "state",
      state: serializeGame()
    });

  }

}

function resetDice() {

  diceValue = 0;

  diceRolling = false;

  waitingForMove = false;

  updateDiceDisplay(0);

  $("dice-hint").textContent =
    "Tap Dice to Roll";

  renderTokens();

}

function updateTurnDisplay() {

  const player = players[currentTurn];

  if (!player) return;

  $("turn-text").textContent =
    `${player.name}'s Turn`;

  $("turn-dot").style.background =
    COLOR_HEX[player.color];

  $("turn-dot").style.color =
    COLOR_HEX[player.color];

  $("turn-badge").style.color =
    COLOR_HEX[player.color];

  updatePlayerCards();

}

/* ================= WINNER ================= */

function finishGame(player) {

  gameOver = true;

  gameStarted = false;

  playSound("win");

  $("dice-hint").textContent =
    `${player.name} Wins! 🏆`;

  $("dice").classList.add("disabled-dice");

  showHint(`${player.name} wins the game! 🏆`);

  if (matchMode === "online" && isHost) {

    broadcast({
      type: "winner",
      color: player.color
    });

  }

}

/* ================= HINT / NOTIFICATION ================= */

function showHint(message) {

  const hint = $("dice-hint");

  hint.textContent = message;

  clearTimeout(gameMessageTimer);

  gameMessageTimer = setTimeout(() => {

    if (!waitingForMove && !diceRolling && !gameOver) {

      hint.textContent = "Tap Dice to Roll";

    }

  }, 2200);

}

function addSystemMessage(message) {

  addChatBubble(
    message,
    "left",
    "System"
  );

}

function showExitModal(name) {

  $("exit-modal-title").textContent =
    "Player Left";

  $("exit-modal-desc").textContent =
    `${name} has disconnected from the game.`;

  $("exit-modal").classList.remove("hidden");

}

window.closeExitModal = function() {

  $("exit-modal").classList.add("hidden");

};

/* ================= CHAT ================= */

window.toggleChat = function(open) {

  chatOpen = open;

  $("chat-drawer").classList.toggle(
    "open",
    open
  );

  if (open) {

    unreadMessages = 0;

    $("unread-badge").style.display = "none";

    $("chat-input").focus();

    $("chat-messages").scrollTop =
      $("chat-messages").scrollHeight;

  }

};

function addChatBubble(message, side, sender = "") {

  const container = $("chat-messages");

  const bubble = document.createElement("div");

  bubble.className =
    `message-bubble ${side}`;

  if (sender) {

    const name = document.createElement("div");

    name.style.fontSize = "10px";

    name.style.fontWeight = "800";

    name.style.opacity = "0.7";

    name.style.marginBottom = "4px";

    name.textContent = sender;

    bubble.appendChild(name);

  }

  const content = document.createElement("div");

  content.textContent = message;

  bubble.appendChild(content);

  container.appendChild(bubble);

  container.scrollTop = container.scrollHeight;

  if (side === "left" && !chatOpen) {

    unreadMessages++;

    $("unread-badge").style.display = "block";

  }

}

window.sendChatMessage = function() {

  const input = $("chat-input");

  const message = input.value.trim();

  if (!message) return;

  if (matchMode === "online" && !isConnected()) {

    showHint("Not connected to another player");

    return;

  }

  const sender =
    myColor
      ? COLOR_NAMES[myColor]
      : "Player";

  addChatBubble(
    message,
    "right",
    "You"
  );

  if (matchMode === "online") {

    sendNetwork({
      type: "chat",
      message,
      sender
    });

  }

  input.value = "";

  playSound("message");

};

window.sendQuickMessage = function(message) {

  $("chat-input").value = message;

  sendChatMessage();

};

/* ================= PEERJS HELPERS ================= */

function isConnected() {

  if (isHost) {

    return connections.some(
      connection => connection.open
    );

  }

  return !!hostConnection?.open;

}

function sendNetwork(data) {

  if (isHost) {

    broadcast(data);

  } else if (hostConnection?.open) {

    hostConnection.send(data);

  }

}

function broadcast(data) {

  connections.forEach(connection => {

    if (connection.open) {

      try {

        connection.send(data);

      } catch (error) {

        console.warn(error);

      }

    }

  });

}

/* ================= ONLINE ROOM CREATION ================= */

async function createOnlineRoom() {

  if (typeof Peer === "undefined") {

    alert("PeerJS library could not load.");

    return;

  }

  isHost = true;

  myColor = selectedColor;

  roomCode = generateRoomCode();

  $("room-status-text").textContent =
    "Creating room...";

  $("start-btn").disabled = true;

  peer = new Peer(
    `ludo-${roomCode}`,
    {
      debug: 1
    }
  );

  peer.on("open", id => {

    myPeerId = id;

    $("room-status-text").textContent =
      `Room created! Code: ${roomCode}`;

    $("room-tag").textContent =
      `ROOM: ${roomCode}`;

    $("room-tag").style.display = "block";

    players = [createPlayer(myColor)];

    initializeGame();

    addSystemMessage(
      `Room ${roomCode} created. Waiting for players.`
    );

  });

  peer.on("connection", connection => {

    handleHostConnection(connection);

  });

  peer.on("error", error => {

    console.error("PeerJS error:", error);

    $("room-status-text").textContent =
      `Connection error: ${error.type}`;

    $("start-btn").disabled = false;

  });

}

/* ================= HOST CONNECTION ================= */

function handleHostConnection(connection) {

  connection.on("open", () => {

    const available = COLORS.filter(color =>

      !players.some(player => player.color === color)

    );

    if (available.length === 0) {

      connection.send({
        type: "room-full"
      });

      connection.close();

      return;

    }

    const color = available[0];

    const player = createPlayer(
      color,
      connection.peer
    );

    player.isLocal = false;

    players.push(player);

    connections.push(connection);

    connection.send({

      type: "welcome",

      color,

      roomCode,

      host: true,

      state: serializeGame()

    });

    addSystemMessage(
      `${COLOR_NAMES[color]} joined the room.`
    );

    updatePlayerCards();

    renderTokens();

    connection.on("data", data => {

      handleHostData(connection, data);

    });

    connection.on("close", () => {

      handleDisconnect(connection);

    });

    connection.on("error", () => {

      handleDisconnect(connection);

    });

    broadcast({

      type: "player-list",

      players: players.map(p => ({
        color: p.color,
        name: p.name
      }))

    });

  });

}

/* ================= HOST DATA HANDLER ================= */

function handleHostData(connection, data) {

  if (!data || typeof data !== "object") return;

  if (data.type === "chat") {

    addChatBubble(
      data.message,
      "left",
      data.sender
    );

    broadcast(data);

    return;

  }

  if (data.type === "roll") {

    const player = players.find(
      p => p.peerId === connection.peer
    );

    if (!player) return;

    if (players[currentTurn]?.color !== player.color) return;

    if (diceRolling || waitingForMove) return;

    const result = Math.floor(Math.random() * 6) + 1;

    diceRolling = false;

    diceValue = result;

    finishRemoteDice(result);

    return;

  }

  if (data.type === "move") {

    const playerIndex = players.findIndex(
      p => p.peerId === connection.peer
    );

    if (playerIndex !== currentTurn) return;

    if (!waitingForMove) return;

    if (!Number.isInteger(data.index)) return;

    const movable = getMovableTokens(
      players[playerIndex]
    );

    if (!movable.includes(data.index)) return;

    moveToken(playerIndex, data.index);

  }

}

function finishRemoteDice(value) {

  diceValue = value;

  diceRolling = false;

  $("dice").classList.remove("rolling");

  createDicePips(value);

  $("dice-hint").textContent =
    `Dice: ${value}`;

  const possible = getMovableTokens(
    players[currentTurn]
  );

  if (!possible.length) {

    if (value === 6) {

      resetDice();

    } else {

      nextTurn();

    }

  } else {

    waitingForMove = true;

    renderTokens();

  }

  broadcast({
    type: "dice",
    value,
    currentTurn
  });

}

/* ================= ONLINE JOIN ================= */

async function joinOnlineRoom() {

  if (typeof Peer === "undefined") {

    alert("PeerJS library could not load.");

    return;

  }

  roomCode = $("room-code-input").value.trim();

  if (!/^\d{5}$/.test(roomCode)) {

    alert("Enter a valid five-digit room code.");

    return;

  }

  isHost = false;

  myColor = null;

  $("room-status-text").textContent =
    "Connecting to room...";

  $("start-btn").disabled = true;

  peer = new Peer({
    debug: 1
  });

  peer.on("open", id => {

    myPeerId = id;

    hostConnection = peer.connect(
      `ludo-${roomCode}`,
      {
        reliable: true
      }
    );

    hostConnection.on("open", () => {

      $("room-status-text").textContent =
        "Connected! Waiting for game data...";

    });

    hostConnection.on("data", handleGuestData);

    hostConnection.on("close", () => {

      showExitModal("Host");

    });

    hostConnection.on("error", error => {

      console.error(error);

      $("room-status-text").textContent =
        "Connection failed.";

      $("start-btn").disabled = false;

    });

  });

  peer.on("error", error => {

    console.error(error);

    $("room-status-text").textContent =
      "Room not found or connection failed.";

    $("start-btn").disabled = false;

  });

}

/* ================= GUEST DATA HANDLER ================= */

function handleGuestData(data) {

  if (!data) return;

  switch (data.type) {

    case "room-full":

      $("room-status-text").textContent =
        "Room is full.";

      alert("This room is full.");

      return;

    case "welcome":

      myColor = data.color;

      roomCode = data.roomCode;

      $("room-tag").textContent =
        `ROOM: ${roomCode}`;

      $("room-tag").style.display = "block";

      $("room-status-text").textContent =
        `Joined as ${COLOR_NAMES[myColor]}`;

      players = data.state.players.map(
        deserializePlayer
      );

      applyGameState(data.state);

      gameStarted = true;

      $("setup-modal").classList.add("hidden");

      createBoard();

      updatePlayerCards();

      renderTokens();

      updateTurnDisplay();

      updateDiceDisplay(0);

      addSystemMessage(
        `Joined room as ${COLOR_NAMES[myColor]}.`
      );

      return;

    case "chat":

      addChatBubble(
        data.message,
        "left",
        data.sender
      );

      playSound("message");

      return;

    case "dice":

      diceValue = data.value;

      currentTurn = data.currentTurn;

      waitingForMove = true;

      $("dice").classList.remove("rolling");

      createDicePips(data.value);

      $("dice-hint").textContent =
        `Dice: ${data.value}`;

      updatePlayerCards();

      renderTokens();

      return;

    case "state":

      applyGameState(data.state);

      return;

    case "winner":

      gameOver = true;

      gameStarted = false;

      $("dice-hint").textContent =
        `${COLOR_NAMES[data.color]} Wins! 🏆`;

      playSound("win");

      return;

    case "player-list":

      return;

  }

}

/* ================= ONLINE TOKEN CLICK ================= */

/*
  Override movement handling for guests.
  The host controls the official game state.
*/

const originalHandleTokenClick = handleTokenClick;

async function guestMove(color, index) {

  if (matchMode !== "online" || isHost) {

    return originalHandleTokenClick(
      color,
      index
    );

  }

  if (!waitingForMove) return;

  if (color !== myColor) return;

  const player = players[currentTurn];

  if (!player || player.color !== myColor) return;

  if (!getMovableTokens(player).includes(index)) return;

  if (!hostConnection?.open) {

    showHint("Connection lost!");

    return;

  }

  hostConnection.send({

    type: "move",

    index

  });

}

/*
  Replace token click listeners for online guest.
*/

function refreshGuestTokenHandlers() {

  if (matchMode !== "online" || isHost) return;

  document.querySelectorAll(".token").forEach(token => {

    const color = token.dataset.color;

    const index = Number(token.dataset.index);

    token.onclick = null;

    token.replaceWith(token.cloneNode(true));

    const newToken = document.querySelector(
      `.token[data-color="${color}"][data-index="${index}"]`
    );

    if (!newToken) return;

    newToken.addEventListener("click", () => {

      guestMove(color, index);

    });

  });

}

/* ================= GUEST DICE OVERRIDE ================= */

const originalDiceHandler = window.handleDiceClick;

window.handleDiceClick = function() {

  if (
    matchMode === "online" &&
    !isHost
  ) {

    if (!gameStarted || gameOver) return;

    if (players[currentTurn]?.color !== myColor) {

      showHint("Wait for your turn!");

      return;

    }

    if (diceRolling || waitingForMove) return;

    if (!hostConnection?.open) {

      showHint("Connection lost!");

      return;

    }

    diceRolling = true;

    $("dice").classList.add("rolling");

    $("dice-hint").textContent = "Rolling...";

    hostConnection.send({
      type: "roll"
    });

    return;

  }

  originalDiceHandler();

};

/* ================= GAME STATE SYNC ================= */

function serializeGame() {

  return {

    players: players.map(player => ({

      color: player.color,

      name: player.name,

      peerId: player.peerId,

      connected: player.connected,

      tokens: player.tokens.map(token => ({

        position: token.position,

        finished: token.finished

      }))

    })),

    currentTurn,

    diceValue,

    waitingForMove,

    gameStarted,

    gameOver

  };

}

function deserializePlayer(player) {

  return {

    color: player.color,

    name: player.name,

    peerId: player.peerId,

    connected: player.connected,

    isLocal: player.color === myColor,

    tokens: player.tokens.map(token => ({

      position: token.position,

      finished: token.finished

    }))

  };

}

function applyGameState(state) {

  if (!state) return;

  players = state.players.map(
    deserializePlayer
  );

  currentTurn = state.currentTurn;

  diceValue = state.diceValue;

  waitingForMove = state.waitingForMove;

  gameStarted = state.gameStarted;

  gameOver = state.gameOver;

  diceRolling = false;

  updatePlayerCards();

  updateTurnDisplay();

  createDicePips(diceValue || 1);

  updateDiceDisplay(diceValue || 0);

  renderTokens();

  if (waitingForMove) {

    $("dice-hint").textContent =
      "Select a highlighted token";

  } else if (gameOver) {

    $("dice-hint").textContent =
      "Game Over";

  } else {

    $("dice-hint").textContent =
      "Tap Dice to Roll";

  }

}

/* ================= DISCONNECTION ================= */

function handleDisconnect(connection) {

  const index = connections.indexOf(connection);

  if (index === -1) return;

  const player = players.find(
    p => p.peerId === connection.peer
  );

  if (!player) return;

  const name = player.name;

  players = players.filter(
    p => p.peerId !== connection.peer
  );

  connections = connections.filter(
    c => c !== connection
  );

  if (currentTurn >= players.length) {

    currentTurn = 0;

  }

  updatePlayerCards();

  renderTokens();

  showExitModal(name);

  broadcast({
    type: "state",
    state: serializeGame()
  });

}

/* ================= INPUT EVENTS ================= */

$("room-code-input").addEventListener(
  "input",
  event => {

    event.target.value =
      event.target.value
        .replace(/\D/g, "")
        .slice(0, 5);

    updateStartButton();

  }
);

/* ================= UTILITY ================= */

function delay(ms) {

  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });

}

/* ================= INITIALIZATION ================= */

function initializeApp() {

  createBoard();

  createDicePips(1);

  selectPlayerCount(2);

  selectUserColor("red");

  setMatchMode("offline");

  updateStartButton();

  console.log(
    "Ludo Multiplayer initialized successfully."
  );

}

initializeApp();

})();