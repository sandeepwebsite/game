// ============================================================
// LUDO RANKING SYSTEM
// 1st, 2nd, 3rd, 4th + Finished Players Become Spectators
// Append this block at the END of ludo-script.js
// ============================================================

let finishedPlayers = [];
let isGameOver = false;


// ------------------------------------------------------------
// FINISH SYSTEM HELPERS
// ------------------------------------------------------------

function resetFinishSystem() {
  finishedPlayers = [];
  isGameOver = false;
}

function hasPlayerFinished(color) {
  return finishedPlayers.includes(color);
}

function getPlayerRank(color) {
  return finishedPlayers.indexOf(color) + 1;
}

function getRankText(rank) {
  const suffix = ['th', 'st', 'nd', 'rd'];
  const value = rank % 100;

  return rank + (suffix[(value - 20) % 10] ||
    suffix[value] || suffix[0]);
}

function getNextUnfinishedIndex(startIndex) {
  if (!activePlayers.length) return -1;

  for (let i = 1; i <= activePlayers.length; i++) {
    const index = (startIndex + i) % activePlayers.length;
    const color = activePlayers[index];

    if (!finishedPlayers.includes(color)) {
      return index;
    }
  }

  return -1;
}


// ------------------------------------------------------------
// DISPLAY FINAL RANKINGS
// ------------------------------------------------------------

function showFinalResults() {
  isGameOver = true;

  const modal = document.getElementById('victory-modal');
  const title = document.getElementById('victory-winner-text');

  if (!modal || !title) return;

  title.innerText = 'MATCH COMPLETED! 🏆';
  title.style.color = '#facc15';

  const card = modal.querySelector('.victory-modal-card');
  const subtitle = card.querySelector('.victory-sub');

  if (subtitle) {
    subtitle.innerText = 'Congratulations to all players!';
  }

  let rankingBox = document.getElementById('victory-rankings');

  if (!rankingBox) {
    rankingBox = document.createElement('div');
    rankingBox.id = 'victory-rankings';

    rankingBox.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 9px;
      margin: 18px 0 22px;
    `;

    subtitle.insertAdjacentElement('afterend', rankingBox);
  }

  rankingBox.innerHTML = '';

  const medals = ['🥇', '🥈', '🥉', '🏅'];

  finishedPlayers.forEach((color, index) => {
    const rank = index + 1;

    const row = document.createElement('div');

    row.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 11px 14px;
      border-radius: 12px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
    `;

    const left = document.createElement('div');

    left.style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 800;
      color: white;
    `;

    left.innerHTML = `
      <span style="font-size:22px">${medals[index] || '🏅'}</span>
      <span>${getRankText(rank)} Place</span>
    `;

    const right = document.createElement('span');

    right.innerText = color.toUpperCase();

    right.style.cssText = `
      font-weight: 900;
      color: ${PLAYER_CONFIG[color].color};
    `;

    row.appendChild(left);
    row.appendChild(right);

    rankingBox.appendChild(row);
  });

  audio.play('victory');
  triggerHaptic([40, 80, 40, 80, 100]);

  modal.classList.add('active');
}


// ------------------------------------------------------------
// FINISH A PLAYER
// ------------------------------------------------------------

function finishPlayer(color) {

  if (finishedPlayers.includes(color)) return;

  // A player can finish only when all four tokens reach home.
  if (!gameState[color] ||
      !gameState[color].every(pos => pos === 56)) {
    return;
  }

  finishedPlayers.push(color);

  const rank = finishedPlayers.length;

  audio.play('victory');
  triggerHaptic([40, 60, 40, 60]);

  addMessageToChat(
    'System',
    `🏆 ${color.toUpperCase()} finished in ${getRankText(rank)} place!`,
    'left'
  );

  // Mark the finished player's card as a spectator.
  const card = document.getElementById(`card-${color}`);

  if (card) {
    card.classList.remove('active');
    card.classList.add('disabled');
  }

  const home = document.getElementById(`home-${color}`);

  if (home) {
    home.classList.add('disabled-home');
  }

  // All players have finished.
  if (finishedPlayers.length >= activePlayers.length) {

    isGameOver = true;

    addMessageToChat(
      'System',
      '🎉 All players have completed the match!',
      'left'
    );

    updateTurnUI();
    showFinalResults();

    if (matchMode === 'online' && isHost) {
      broadcastData({
        type: 'FINISH_STATE',
        finishedPlayers: finishedPlayers,
        turnIndex: turnIndex,
        isGameOver: true
      });
    }

    return;
  }

  // Find the next unfinished player.
  const nextIndex = getNextUnfinishedIndex(turnIndex);

  if (nextIndex !== -1) {
    turnIndex = nextIndex;
  }

  resetTurnState();

  currentRoll = null;
  consecutiveSixes = 0;

  isMoving = false;
  isRolling = false;

  updateTurnUI();

  const nextColor = activePlayers[turnIndex];

  const hint = document.getElementById('dice-hint');

  if (hint) {
    hint.innerText =
      `${nextColor.toUpperCase()}'S TURN`;
  }

  // Synchronize rankings in online mode.
  if (matchMode === 'online' && isHost) {
    broadcastData({
      type: 'FINISH_STATE',
      finishedPlayers: finishedPlayers,
      turnIndex: turnIndex,
      isGameOver: false
    });
  }
}


// ------------------------------------------------------------
// TOKEN MOVEMENT FINALIZATION
// Replaces the original finalizeTokenStep()
// ------------------------------------------------------------

function finalizeTokenStep(color, tokenIdx, targetPos) {

  let extraTurnGrant =
    (currentRoll === 6) || (targetPos === 56);

  // Token reached the center.
  if (targetPos === 56) {

    addMessageToChat(
      'Game',
      `${color.toUpperCase()} token reached Home! 🎉`,
      'left'
    );

    triggerHaptic([30, 50, 30, 50]);

    audio.play('tokenHome');

    renderTokens();
    isMoving = false;

    // Check whether all four tokens are home.
    if (gameState[color].every(pos => pos === 56)) {
      finishPlayer(color);
      return;
    }

  } else if (targetPos <= 50) {

    const coords = getCoordinates(color, targetPos);

    if (coords) {

      const coordKey = `${coords[0]},${coords[1]}`;

      // Capture is not allowed on safe spots.
      if (!SAFE_SPOTS.includes(coordKey)) {

        activePlayers.forEach(otherColor => {

          if (
            otherColor !== color &&
            !hasPlayerFinished(otherColor)
          ) {

            gameState[otherColor].forEach(
              (otherPos, otherIdx) => {

                if (otherPos >= 0 && otherPos <= 50) {

                  const otherCoords =
                    getCoordinates(otherColor, otherPos);

                  if (
                    otherCoords &&
                    otherCoords[0] === coords[0] &&
                    otherCoords[1] === coords[1]
                  ) {

                    gameState[otherColor][otherIdx] = -1;

                    extraTurnGrant = true;

                    audio.play('tokenCapture');
                    triggerHaptic([40, 60, 40]);

                    addMessageToChat(
                      'Game',
                      `${color.toUpperCase()} captured ${otherColor.toUpperCase()}! 💥`,
                      'left'
                    );
                  }
                }
              }
            );
          }
        });
      }
    }
  }

  renderTokens();

  isMoving = false;

  if (extraTurnGrant) {

    resetTurnState();

    const hint = document.getElementById('dice-hint');

    if (hint) {
      hint.innerText = 'Bonus Turn! Roll Again';
    }

    updateTurnUI();

  } else {

    nextTurn();
  }
}


// ------------------------------------------------------------
// NEXT TURN
// Automatically skips finished players.
// ------------------------------------------------------------

function nextTurn() {

  if (isGameOver) return;

  resetTurnState();

  currentRoll = null;
  isMoving = false;
  isRolling = false;

  const nextIndex = getNextUnfinishedIndex(turnIndex);

  if (nextIndex === -1) {
    isGameOver = true;
    showFinalResults();
    return;
  }

  turnIndex = nextIndex;

  updateTurnUI();
}


// ------------------------------------------------------------
// UPDATED TURN UI
// Finished players cannot roll or move.
// ------------------------------------------------------------

function updateTurnUI() {

  const currentColor = activePlayers[turnIndex];

  const diceBtn = document.getElementById('dice');
  const hintEl = document.getElementById('dice-hint');

  const turnDot = document.getElementById('turn-dot');
  const turnText = document.getElementById('turn-text');

  if (isGameOver) {

    if (turnText) {
      turnText.innerText = 'MATCH COMPLETED';
      turnText.style.color = '#facc15';
    }

    if (hintEl) {
      hintEl.innerText = 'Match Completed 🏆';
    }

    if (diceBtn) {
      diceBtn.classList.add('disabled-dice');
    }

    document.querySelectorAll('.player-card').forEach(card => {
      card.classList.remove('active');
    });

    return;
  }

  if (!currentColor) return;

  const finished = hasPlayerFinished(currentColor);

  if (turnDot) {
    turnDot.style.backgroundColor =
      PLAYER_CONFIG[currentColor].color;

    turnDot.style.boxShadow =
      `0 0 10px ${PLAYER_CONFIG[currentColor].color}`;
  }

  if (turnText) {

    turnText.innerText = finished
      ? `${currentColor.toUpperCase()} FINISHED`
      : `${currentColor.toUpperCase()}'S TURN`;

    turnText.style.color =
      PLAYER_CONFIG[currentColor].color;
  }

  document.querySelectorAll('.player-card').forEach(card => {
    card.classList.remove('active');
  });

  const activeCard =
    document.getElementById(`card-${currentColor}`);

  if (activeCard && !finished) {
    activeCard.classList.add('active');
  }

  const isMyTurn =
    matchMode !== 'online' ||
    currentColor === selectedColor;

  const canRoll =
    !finished &&
    !isGameOver &&
    isMyTurn &&
    !hasRolled &&
    !isRolling &&
    !isMoving;

  if (diceBtn) {
    diceBtn.classList.toggle('disabled-dice', !canRoll);
  }

  if (hintEl) {

    if (finished) {
      hintEl.innerText = `${currentColor.toUpperCase()} IS A SPECTATOR`;

    } else if (!isMyTurn) {
      hintEl.innerText =
        `Waiting for ${currentColor.toUpperCase()}...`;

    } else if (hasRolled) {
      hintEl.innerText = 'Select Your Token';

    } else {
      hintEl.innerText = 'Tap Dice to Roll';
    }
  }
}


// ------------------------------------------------------------
// UPDATED DICE CLICK
// ------------------------------------------------------------

function handleDiceClick() {

  if (isGameOver) return;

  const currentColor = activePlayers[turnIndex];

  if (!currentColor) return;

  if (hasPlayerFinished(currentColor)) return;

  if (
    matchMode === 'online' &&
    currentColor !== selectedColor
  ) {
    return;
  }

  rollDice();
}


// ------------------------------------------------------------
// UPDATED DICE ROLL
// ------------------------------------------------------------

function rollDice() {

  if (isGameOver) return;

  const currentColor = activePlayers[turnIndex];

  if (!currentColor || hasPlayerFinished(currentColor)) return;

  if (hasRolled || isRolling || isMoving) return;

  if (
    matchMode === 'online' &&
    activePlayers.length < selectedPlayerCount
  ) {

    const hintEl = document.getElementById('dice-hint');

    if (hintEl) {
      hintEl.innerText =
        `Waiting for players... (${activePlayers.length}/${selectedPlayerCount})`;
    }

    return;
  }

  audio.play('diceRoll');
  triggerHaptic(20);

  isRolling = true;

  const diceBtn = document.getElementById('dice');
  const hintEl = document.getElementById('dice-hint');

  if (diceBtn) diceBtn.classList.add('rolling');

  if (hintEl) hintEl.innerText = 'Rolling...';

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


// ------------------------------------------------------------
// UPDATED TOKEN CLICK
// ------------------------------------------------------------

function handleTokenClick(color, tokenIdx) {

  if (isGameOver) return;

  if (hasPlayerFinished(color)) return;

  if (
    !hasRolled ||
    isRolling ||
    isMoving ||
    activePlayers[turnIndex] !== color
  ) {
    return;
  }

  if (
    matchMode === 'online' &&
    color !== selectedColor
  ) {
    return;
  }

  const currentPos = gameState[color][tokenIdx];

  if (!isValidMove(color, currentPos, currentRoll)) return;

  const targetPos =
    currentPos === -1 && currentRoll === 6
      ? 0
      : currentPos + currentRoll;

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


// ------------------------------------------------------------
// RESTART MATCH
// Clears rankings and restores every token.
// ------------------------------------------------------------

function restartMatch() {

  audio.play('click');

  hideVictoryModal();

  resetFinishSystem();

  activePlayers.forEach(color => {
    gameState[color] = [-1, -1, -1, -1];
  });

  turnIndex = 0;

  currentRoll = null;
  consecutiveSixes = 0;

  isRolling = false;
  isMoving = false;

  resetTurnState();

  clearHighlights();

  setupPlayerCards();

  renderTokens();
  updateTurnUI();

  addMessageToChat(
    'System',
    'Match Restarted!',
    'left'
  );

  if (matchMode === 'online') {

    broadcastData({
      type: 'RESTART_MATCH',
      gameState: gameState,
      turnIndex: turnIndex,
      finishedPlayers: [],
      isGameOver: false
    });
  }
}


// ------------------------------------------------------------
// RESET FINISH STATE WHEN STARTING OFFLINE
// ------------------------------------------------------------

const originalInitOfflineGame = initOfflineGame;

initOfflineGame = function () {

  resetFinishSystem();

  originalInitOfflineGame();

  currentRoll = null;
  consecutiveSixes = 0;

  isRolling = false;
  isMoving = false;

  updateTurnUI();
};


// ------------------------------------------------------------
// RESET FINISH STATE WHEN HOST CREATES ONLINE ROOM
// ------------------------------------------------------------

const originalInitOnlineRoom = initOnlineRoom;

initOnlineRoom = function () {

  if (onlineAction === 'create') {
    resetFinishSystem();
  }

  originalInitOnlineRoom();
};


// ------------------------------------------------------------
// NETWORK FINISH STATE SYNCHRONIZATION
// ------------------------------------------------------------

const originalHandleNetworkData = handleNetworkData;

handleNetworkData = function (data, senderConn) {

  if (!data) return;

  // Host informs all clients about player rankings.
  if (data.type === 'FINISH_STATE') {

    finishedPlayers = Array.isArray(data.finishedPlayers)
      ? [...data.finishedPlayers]
      : [];

    turnIndex = data.turnIndex ?? turnIndex;

    isGameOver = !!data.isGameOver;

    resetTurnState();

    currentRoll = null;
    consecutiveSixes = 0;

    isRolling = false;
    isMoving = false;

    clearHighlights();

    setupPlayerCards();

    renderTokens();

    updateTurnUI();

    if (isGameOver) {
      showFinalResults();
    }

    return;
  }

  // Restart synchronization.
  if (data.type === 'RESTART_MATCH') {

    gameState = data.gameState;
    turnIndex = data.turnIndex || 0;

    resetFinishSystem();

    currentRoll = null;
    consecutiveSixes = 0;

    isRolling = false;
    isMoving = false;

    hideVictoryModal();

    resetTurnState();

    clearHighlights();

    setupPlayerCards();

    renderTokens();

    updateTurnUI();

    addMessageToChat(
      'System',
      'Match Restarted by Host!',
      'left'
    );

    return;
  }

  // Preserve all original network functionality.
  originalHandleNetworkData(data, senderConn);

  // Newly joined players receive the current ranking state
  // through the normal initialization flow.
  if (
    data.type === 'INIT_CLIENT' ||
    data.type === 'PLAYER_JOINED'
  ) {

    if (Array.isArray(data.finishedPlayers)) {
      finishedPlayers = [...data.finishedPlayers];
    }

    if (typeof data.isGameOver === 'boolean') {
      isGameOver = data.isGameOver;
    }

    updateTurnUI();
  }
};


// ------------------------------------------------------------
// HOST: SEND CURRENT FINISH STATE TO NEW PLAYERS
// ------------------------------------------------------------

const originalBroadcastData = broadcastData;

broadcastData = function (data) {

  if (data && data.type === 'INIT_CLIENT') {
    data.finishedPlayers = [...finishedPlayers];
    data.isGameOver = isGameOver;
  }

  originalBroadcastData(data);
};


// ------------------------------------------------------------
// PLAYER LEAVES: REMOVE FROM RANKING IF NOT FINISHED
// ------------------------------------------------------------

const originalShowPlayerExitModal = showPlayerExitModal;

showPlayerExitModal = function (playerColor) {

  if (finishedPlayers.includes(playerColor)) {
    finishedPlayers =
      finishedPlayers.filter(c => c !== playerColor);
  }

  originalShowPlayerExitModal(playerColor);
};


// ------------------------------------------------------------
// INITIALIZE RANKING SYSTEM
// ------------------------------------------------------------

resetFinishSystem();

console.log('Ludo ranking and spectator system loaded!');