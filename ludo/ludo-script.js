// =====================================================
// ADD THESE VARIABLES IN GAME CONFIGURATION & STATE
// =====================================================

let finishedPlayers = [];
let isGameOver = false;


// =====================================================
// SEQUENTIAL RANKING SYSTEM
// Add these functions after your Game State variables
// =====================================================

function resetFinishSystem() {
  finishedPlayers = [];
  isGameOver = false;
}

function hasPlayerFinished(color) {
  return finishedPlayers.includes(color);
}

function getRankSuffix(rank) {
  if (rank % 100 >= 11 && rank % 100 <= 13) return 'th';

  switch (rank % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

function getNextUnfinishedPlayer(startIndex) {
  if (!activePlayers.length) return -1;

  for (let i = 0; i < activePlayers.length; i++) {
    const index = (startIndex + i) % activePlayers.length;
    const color = activePlayers[index];

    if (!finishedPlayers.includes(color)) {
      return index;
    }
  }

  return -1;
}

function finishPlayer(color) {
  if (isGameOver || hasPlayerFinished(color)) return;

  // Confirm that all four tokens have reached home.
  if (!gameState[color] || !gameState[color].every(pos => pos === 56)) {
    return;
  }

  finishedPlayers.push(color);

  const rank = finishedPlayers.length;
  const rankText = `${rank}${getRankSuffix(rank)}`;

  addMessageToChat(
    "System",
    `🏆 ${color.toUpperCase()} finished in ${rankText} place!`,
    'left'
  );

  audio.play(rank === 1 ? 'victory' : 'tokenHome');
  triggerHaptic([40, 80, 40, 80, 100]);

  // All players have completed the game.
  if (finishedPlayers.length >= activePlayers.length) {
    isGameOver = true;
    hasRolled = false;
    isRolling = false;
    isMoving = false;

    if (matchMode === 'online' && isHost) {
      broadcastData({
        type: 'FINISH_STATE',
        finishedPlayers: [...finishedPlayers],
        turnIndex: turnIndex,
        isGameOver: true
      });
    }

    showFinalResults();
    updateTurnUI();
    return;
  }

  // Move to the next player who has not finished.
  consecutiveSixes = 0;
  currentRoll = null;
  hasRolled = false;
  isRolling = false;
  isMoving = false;

  const nextIndex = getNextUnfinishedPlayer(
    (turnIndex + 1) % activePlayers.length
  );

  if (nextIndex !== -1) {
    turnIndex = nextIndex;
  }

  updateTurnUI();

  // Host synchronizes rankings with online players.
  if (matchMode === 'online' && isHost) {
    broadcastData({
      type: 'FINISH_STATE',
      finishedPlayers: [...finishedPlayers],
      turnIndex: turnIndex,
      isGameOver: false
    });
  }
}


// =====================================================
// FINAL RESULTS MODAL
// Add this function
// =====================================================

function showFinalResults() {
  const modal = document.getElementById('victory-modal');
  const titleEl = document.getElementById('victory-winner-text');

  if (!modal) return;

  const card = modal.querySelector('.victory-modal-card');
  if (!card) return;

  let rankingsEl = document.getElementById('victory-rankings');

  if (!rankingsEl) {
    rankingsEl = document.createElement('div');
    rankingsEl.id = 'victory-rankings';

    const sub = card.querySelector('.victory-sub');
    if (sub) {
      sub.insertAdjacentElement('afterend', rankingsEl);
    } else {
      card.appendChild(rankingsEl);
    }
  }

  const medals = ['🥇', '🥈', '🥉', '🏅'];

  rankingsEl.innerHTML = `
    <div style="margin:15px 0 20px;text-align:left;">
      ${finishedPlayers.map((color, index) => `
        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          padding:12px 14px;
          margin:8px 0;
          border-radius:12px;
          background:rgba(255,255,255,0.08);
          border:1px solid rgba(255,255,255,0.08);
          color:#f8fafc;
          font-weight:700;
        ">
          <span>
            ${medals[index] || '🏅'}
            ${index + 1}${getRankSuffix(index + 1)} Place
          </span>
          <span style="
            color:${PLAYER_CONFIG[color]?.color || '#fff'};
            text-transform:uppercase;
          ">
            ${color}
          </span>
        </div>
      `).join('')}
    </div>
  `;

  if (titleEl) {
    titleEl.innerText = 'MATCH COMPLETED!';
    titleEl.style.color = '#facc15';
  }

  const sub = card.querySelector('.victory-sub');
  if (sub) {
    sub.innerText = 'All players have reached home!';
  }

  modal.classList.add('active');
}


// =====================================================
// REPLACE YOUR EXISTING restartMatch() WITH THIS
// =====================================================

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
  renderTokens();
  updateTurnUI();

  addMessageToChat("System", "Match Restarted!", 'left');

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


// =====================================================
// ADD resetFinishSystem() TO initOfflineGame()
// Replace your existing initOfflineGame() with this
// =====================================================

function initOfflineGame() {
  resetFinishSystem();

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

  ALL_COLORS.forEach(color => {
    if (activePlayers.includes(color)) {
      gameState[color] = [-1, -1, -1, -1];
    }
  });

  turnIndex = 0;
  currentRoll = null;
  consecutiveSixes = 0;
  isRolling = false;
  isMoving = false;

  resetTurnState();

  setupPlayerCards();

  document.getElementById('room-tag').style.display = 'none';
  document.getElementById('setup-modal').classList.add('hidden');

  renderTokens();
  updateTurnUI();

  addMessageToChat("System", "Offline Match Started!", 'left');
}


// =====================================================
// ADD resetFinishSystem() TO ONLINE HOST INITIALIZATION
// Inside initOnlineRoom(), in the CREATE section,
// add resetFinishSystem() before creating the Peer.
// =====================================================

// Add this inside:
// if (onlineAction === 'create') {
//
//   resetFinishSystem();
//   turnIndex = 0;
//   consecutiveSixes = 0;
//   currentRoll = null;
//   resetTurnState();
//
// }


// =====================================================
// REPLACE handleDiceClick() WITH THIS
// =====================================================

function handleDiceClick() {
  if (isGameOver || isRolling || isMoving) return;

  const currentColor = activePlayers[turnIndex];

  if (!currentColor || hasPlayerFinished(currentColor)) return;

  if (matchMode === 'online' && currentColor !== selectedColor) {
    return;
  }

  rollDice();
}


// =====================================================
// REPLACE rollDice() WITH THIS
// =====================================================

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


// =====================================================
// REPLACE executeRemoteRoll() WITH THIS
// =====================================================

function executeRemoteRoll(rollValue) {
  if (isGameOver) return;

  const currentColor = activePlayers[turnIndex];

  if (!currentColor || hasPlayerFinished(currentColor)) return;

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


// =====================================================
// REPLACE finishRoll() WITH THIS
// =====================================================

function finishRoll(rollValue) {
  if (isGameOver) return;

  const color = activePlayers[turnIndex];

  if (!color || hasPlayerFinished(color)) return;

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

    setTimeout(() => {
      if (!isGameOver) nextTurn();
    }, 1000);

    return;
  }

  if (!hasValidMoves(color, currentRoll)) {
    if (hintEl) hintEl.innerText = "No Valid Move!";

    setTimeout(() => {
      if (!isGameOver) nextTurn();
    }, 1000);
  } else {
    if (hintEl) hintEl.innerText = `Rolled ${currentRoll}! Select Token`;

    highlightMovableTokens(color, currentRoll);
  }

  updateTurnUI();
}


// =====================================================
// REPLACE handleTokenClick() WITH THIS
// =====================================================

function handleTokenClick(color, tokenIdx) {
  if (isGameOver) return;
  if (hasPlayerFinished(color)) return;

  if (!hasRolled || isRolling || isMoving) return;
  if (activePlayers[turnIndex] !== color) return;

  if (matchMode === 'online' && color !== selectedColor) return;

  const currentPos = gameState[color][tokenIdx];

  if (!isValidMove(color, currentPos, currentRoll)) return;

  const targetPos =
    (currentPos === -1 && currentRoll === 6)
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


// =====================================================
// REPLACE executeRemoteMove() WITH THIS
// =====================================================

function executeRemoteMove(color, tokenIdx, targetPos) {
  if (isGameOver || hasPlayerFinished(color)) return;
  if (!gameState[color]) return;

  isMoving = true;
  clearHighlights();

  const currentPos = gameState[color][tokenIdx];

  if (currentPos === -1) {
    gameState[color][tokenIdx] = 0;

    audio.play('tokenMove');
    triggerHaptic(20);

    renderTokens(`${color}-${tokenIdx}`);

    setTimeout(() => {
      finalizeTokenStep(color, tokenIdx, targetPos);
    }, 200);

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


// =====================================================
// REPLACE finalizeTokenStep() WITH THIS
// =====================================================

function finalizeTokenStep(color, tokenIdx, targetPos) {
  if (isGameOver) {
    isMoving = false;
    return;
  }

  let extraTurnGrant = (currentRoll === 6) || (targetPos === 56);

  if (targetPos === 56) {
    addMessageToChat(
      "Game",
      `${color.toUpperCase()} token reached Home! 🎉`,
      'left'
    );

    triggerHaptic([30, 50, 30, 50]);

    // Check whether all four tokens of this player are home.
    if (gameState[color].every(pos => pos === 56)) {
      renderTokens();
      isMoving = false;

      finishPlayer(color);
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

          if (otherColor === color || hasPlayerFinished(otherColor)) {
            return;
          }

          gameState[otherColor].forEach((otherPos, otherIdx) => {

            if (otherPos >= 0 && otherPos <= 50) {
              const otherCoords = getCoordinates(otherColor, otherPos);

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
                  "Game",
                  `${color.toUpperCase()} captured ${otherColor.toUpperCase()}! 💥`,
                  'left'
                );
              }
            }

          });
        });
      }
    }
  }

  renderTokens();
  isMoving = false;

  if (extraTurnGrant) {
    resetTurnState();

    const hintEl = document.getElementById('dice-hint');

    if (hintEl) {
      hintEl.innerText = "Bonus Turn! Roll Again";
    }

    updateTurnUI();

  } else {
    nextTurn();
  }
}


// =====================================================
// REPLACE nextTurn() WITH THIS
// =====================================================

function nextTurn() {
  if (isGameOver) return;

  resetTurnState();

  currentRoll = null;
  isRolling = false;
  isMoving = false;
  consecutiveSixes = 0;

  const nextIndex = getNextUnfinishedPlayer(
    (turnIndex + 1) % activePlayers.length
  );

  if (nextIndex === -1) {
    isGameOver = true;
    showFinalResults();
    updateTurnUI();
    return;
  }

  turnIndex = nextIndex;

  clearHighlights();
  updateTurnUI();
}


// =====================================================
// REPLACE updateTurnUI() WITH THIS
// =====================================================

function updateTurnUI() {
  const currentColor = activePlayers[turnIndex];

  const turnDot = document.getElementById('turn-dot');
  const turnText = document.getElementById('turn-text');
  const diceBtn = document.getElementById('dice');
  const hintEl = document.getElementById('dice-hint');

  if (!currentColor) return;

  if (turnDot) {
    turnDot.style.backgroundColor = PLAYER_CONFIG[currentColor].color;
    turnDot.style.boxShadow =
      `0 0 10px ${PLAYER_CONFIG[currentColor].color}`;
  }

  if (turnText) {
    turnText.innerText = isGameOver
      ? "MATCH COMPLETED"
      : `${currentColor.toUpperCase()}'S TURN`;

    turnText.style.color =
      PLAYER_CONFIG[currentColor].color;
  }

  document.querySelectorAll('.player-card').forEach(card => {
    card.classList.remove('active');
    card.classList.remove('finished-player');
  });

  // Highlight the current player.
  const activeCard = document.getElementById(`card-${currentColor}`);

  if (activeCard && !hasPlayerFinished(currentColor)) {
    activeCard.classList.add('active');
  }

  // Mark completed players.
  finishedPlayers.forEach(color => {
    const card = document.getElementById(`card-${color}`);

    if (card) {
      card.classList.add('finished-player');
    }
  });

  const isFinished = hasPlayerFinished(currentColor);

  const isLocalTurn =
    matchMode === 'offline' || currentColor === selectedColor;

  const canRoll =
    !isGameOver &&
    !isFinished &&
    isLocalTurn &&
    !hasRolled &&
    !isRolling &&
    !isMoving;

  if (diceBtn) {
    diceBtn.classList.toggle('disabled-dice', !canRoll);
    diceBtn.style.pointerEvents = canRoll ? 'auto' : 'none';
    diceBtn.style.opacity = canRoll ? '1' : '0.5';
  }

  if (hintEl) {
    if (isGameOver) {
      hintEl.innerText = "Match Completed!";
    } else if (isFinished) {
      hintEl.innerText = `${currentColor.toUpperCase()} has finished!`;
    } else if (!isLocalTurn) {
      hintEl.innerText = `Waiting for ${currentColor.toUpperCase()}...`;
    } else if (hasRolled) {
      hintEl.innerText = `Rolled ${currentRoll}! Select Token`;
    } else {
      hintEl.innerText = "Tap Dice to Roll";
    }
  }
}


// =====================================================
// UPDATE renderTokens()
// Replace your existing renderTokens() with this
// =====================================================

function renderTokens(activeMovingTokenKey = null) {
  document.querySelectorAll('.token').forEach(t => t.remove());

  activePlayers.forEach(color => {
    if (!gameState[color]) return;

    gameState[color].forEach((pos, idx) => {
      const token = document.createElement('div');

      token.className = `token ${color}`;
      token.dataset.color = color;
      token.dataset.index = idx;

      if (hasPlayerFinished(color)) {
        token.classList.add('finished-token');
      }

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


// =====================================================
// ONLINE MULTIPLAYER FINISH SYNCHRONIZATION
// Add this case inside handleNetworkData()
// =====================================================

/*
} else if (data.type === 'FINISH_STATE') {

  // Only accept the host's ranking state.
  if (!isHost) {
    finishedPlayers = [...data.finishedPlayers];
    turnIndex = data.turnIndex;
    isGameOver = Boolean(data.isGameOver);

    hasRolled = false;
    isRolling = false;
    isMoving = false;
    currentRoll = null;

    clearHighlights();
    renderTokens();
    updateTurnUI();

    if (isGameOver) {
      showFinalResults();
    } else {
      addMessageToChat(
        "System",
        "Player rankings updated!",
        'left'
      );
    }
  }
*/


// =====================================================
// UPDATE THE RESTART_MATCH CASE INSIDE handleNetworkData()
// Replace your existing RESTART_MATCH case with this
// =====================================================

/*
} else if (data.type === 'RESTART_MATCH') {

  gameState = data.gameState;
  turnIndex = data.turnIndex;

  resetFinishSystem();

  currentRoll = null;
  consecutiveSixes = 0;
  isRolling = false;
  isMoving = false;

  hideVictoryModal();
  resetTurnState();

  renderTokens();
  updateTurnUI();

  addMessageToChat(
    "System",
    "Match Restarted by Host!",
    'left'
  );
*/


// =====================================================
// ADD THIS TO THE INIT_CLIENT CASE
// After receiving activePlayers and gameState
// =====================================================

/*
finishedPlayers = data.finishedPlayers || [];
isGameOver = Boolean(data.isGameOver);
*/


// =====================================================
// UPDATE INIT_CLIENT MESSAGE SENT BY HOST
// Add these properties to the INIT_CLIENT object
// =====================================================

/*
finishedPlayers: [...finishedPlayers],
isGameOver: isGameOver
*/


// =====================================================
// UPDATE PLAYER_JOINED HANDLING
// Keep finished players in activePlayers.
// Do not remove them from the game just because they finished.
// =====================================================


// =====================================================
// OPTIONAL CSS FOR FINISHED PLAYER CARDS AND TOKENS
// Add to your injected style.innerHTML or stylesheet
// =====================================================

/*
.finished-player {
  opacity: 0.55;
  filter: grayscale(0.7);
}

.finished-token {
  cursor: default !important;
}

.finished-token::after {
  content: "✓";
  position: absolute;
  font-size: 9px;
  font-weight: 900;
  color: white;
}

.disabled-dice {
  pointer-events: none;
  opacity: 0.5;
}
*/