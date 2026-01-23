// ============================================
// 1. GAME VARIABLES (MEMORY SAFE)
// ============================================
let gameMode = 'local'; 
let totalPlayers = 2; 
let activeColors = []; 
let turnIndex = 0; 
let turn = 'red'; 
let diceValue = 0;

// STATE FLAGS
let isRolling = false;
let waitingForMove = false; 
let isSoundOn = true;
let sixCount = 0; 

// TIMER HANDLES
let rollInterval = null;
let moveInterval = null;
let animationFrameId = null;

// 0-56: Path Index, -1: Home, 999: Finished
let positions = {
    red: [-1, -1, -1, -1],
    green: [-1, -1, -1, -1],
    yellow: [-1, -1, -1, -1],
    blue: [-1, -1, -1, -1]
};

// ============================================
// 2. AUDIO SYSTEM
// ============================================
const sounds = { 
    roll: new Audio('roll.mp3'), 
    step: new Audio('step.mp3'), 
    win: new Audio('win.mp3') 
};
Object.values(sounds).forEach(s => s.preload = 'auto');

const statusText = document.getElementById('game-status');

// ============================================
// 3. COORDINATES & PATHS
// ============================================
const homes = {
    red:    [{top:'11%', left:'11%'}, {top:'11%', left:'23%'}, {top:'22%', left:'11%'}, {top:'22%', left:'23%'}],
    green:  [{top:'11%', left:'71.5%'}, {top:'11%', left:'83.5%'}, {top:'22%', left:'71.5%'}, {top:'22%', left:'83.5%'}],
    yellow: [{top:'72%', left:'71.5%'}, {top:'72%', left:'83.5%'}, {top:'82%', left:'71.5%'}, {top:'82%', left:'83.5%'}],
    blue:   [{top:'71%', left:'11%'}, {top:'71%', left:'23%'}, {top:'82%', left:'11%'}, {top:'82%', left:'23%'}]
};

const redPath = [{x:1,y:6}, {x:2,y:6}, {x:3,y:6}, {x:4,y:6}, {x:5,y:6}, {x:6,y:5}, {x:6,y:4}, {x:6,y:3}, {x:6,y:2}, {x:6,y:1}, {x:6,y:0}, {x:7,y:0}, {x:8,y:0}, {x:8,y:1}, {x:8,y:2}, {x:8,y:3}, {x:8,y:4}, {x:8,y:5}, {x:9,y:6}, {x:10,y:6}, {x:11,y:6}, {x:12,y:6}, {x:13,y:6}, {x:14,y:6}, {x:14,y:7}, {x:14,y:8}, {x:13,y:8}, {x:12,y:8}, {x:11,y:8}, {x:10,y:8}, {x:9,y:8}, {x:8,y:9}, {x:8,y:10}, {x:8,y:11}, {x:8,y:12}, {x:8,y:13}, {x:8,y:14}, {x:7,y:14}, {x:6,y:14}, {x:6,y:13}, {x:6,y:12}, {x:6,y:11}, {x:6,y:10}, {x:6,y:9}, {x:5,y:8}, {x:4,y:8}, {x:3,y:8}, {x:2,y:8}, {x:1,y:8}, {x:0,y:8}, {x:0,y:7}, {x:1,y:7}, {x:2,y:7}, {x:3,y:7}, {x:4,y:7}, {x:5,y:7}, {x:6,y:7}];
const greenPath = [{x:8,y:1}, {x:8,y:2}, {x:8,y:3}, {x:8,y:4}, {x:8,y:5}, {x:9,y:6}, {x:10,y:6}, {x:11,y:6}, {x:12,y:6}, {x:13,y:6}, {x:14,y:6}, {x:14,y:7}, {x:14,y:8}, {x:13,y:8}, {x:12,y:8}, {x:11,y:8}, {x:10,y:8}, {x:9,y:8}, {x:8,y:9}, {x:8,y:10}, {x:8,y:11}, {x:8,y:12}, {x:8,y:13}, {x:8,y:14}, {x:7,y:14}, {x:6,y:14}, {x:6,y:13}, {x:6,y:12}, {x:6,y:11}, {x:6,y:10}, {x:6,y:9}, {x:5,y:8}, {x:4,y:8}, {x:3,y:8}, {x:2,y:8}, {x:1,y:8}, {x:0,y:8}, {x:0,y:7}, {x:0,y:6}, {x:1,y:6}, {x:2,y:6}, {x:3,y:6}, {x:4,y:6}, {x:5,y:6}, {x:6,y:5}, {x:6,y:4}, {x:6,y:3}, {x:6,y:2}, {x:6,y:1}, {x:6,y:0}, {x:7,y:0}, {x:7,y:1}, {x:7,y:2}, {x:7,y:3}, {x:7,y:4}, {x:7,y:5}, {x:7,y:6}];
const yellowPath = [{x:13,y:8}, {x:12,y:8}, {x:11,y:8}, {x:10,y:8}, {x:9,y:8}, {x:8,y:9}, {x:8,y:10}, {x:8,y:11}, {x:8,y:12}, {x:8,y:13}, {x:8,y:14}, {x:7,y:14}, {x:6,y:14}, {x:6,y:13}, {x:6,y:12}, {x:6,y:11}, {x:6,y:10}, {x:6,y:9}, {x:5,y:8}, {x:4,y:8}, {x:3,y:8}, {x:2,y:8}, {x:1,y:8}, {x:0,y:8}, {x:0,y:7}, {x:0,y:6}, {x:1,y:6}, {x:2,y:6}, {x:3,y:6}, {x:4,y:6}, {x:5,y:6}, {x:6,y:5}, {x:6,y:4}, {x:6,y:3}, {x:6,y:2}, {x:6,y:1}, {x:6,y:0}, {x:7,y:0}, {x:8,y:0}, {x:8,y:1}, {x:8,y:2}, {x:8,y:3}, {x:8,y:4}, {x:8,y:5}, {x:9,y:6}, {x:10,y:6}, {x:11,y:6}, {x:12,y:6}, {x:13,y:6}, {x:14,y:6}, {x:14,y:7}, {x:13,y:7}, {x:12,y:7}, {x:11,y:7}, {x:10,y:7}, {x:9,y:7}, {x:8,y:7}];
const bluePath = [{x:6,y:13}, {x:6,y:12}, {x:6,y:11}, {x:6,y:10}, {x:6,y:9}, {x:5,y:8}, {x:4,y:8}, {x:3,y:8}, {x:2,y:8}, {x:1,y:8}, {x:0,y:8}, {x:0,y:7}, {x:0,y:6}, {x:1,y:6}, {x:2,y:6}, {x:3,y:6}, {x:4,y:6}, {x:5,y:6}, {x:6,y:5}, {x:6,y:4}, {x:6,y:3}, {x:6,y:2}, {x:6,y:1}, {x:6,y:0}, {x:7,y:0}, {x:8,y:0}, {x:8,y:1}, {x:8,y:2}, {x:8,y:3}, {x:8,y:4}, {x:8,y:5}, {x:9,y:6}, {x:10,y:6}, {x:11,y:6}, {x:12,y:6}, {x:13,y:6}, {x:14,y:6}, {x:14,y:7}, {x:14,y:8}, {x:13,y:8}, {x:12,y:8}, {x:11,y:8}, {x:10,y:8}, {x:9,y:8}, {x:8,y:9}, {x:8,y:10}, {x:8,y:11}, {x:8,y:12}, {x:8,y:13}, {x:8,y:14}, {x:7,y:14}, {x:7,y:13}, {x:7,y:12}, {x:7,y:11}, {x:7,y:10}, {x:7,y:9}, {x:7,y:8}];
const paths = { red: redPath, green: greenPath, yellow: yellowPath, blue: bluePath };

// ============================================
// 4. GAME LOGIC
// ============================================

function startGame(mode) {
    if (mode === 'cpu') {
        gameMode = 'cpu'; totalPlayers = 2; activeColors = ['red', 'yellow'];
    } else {
        gameMode = 'local'; totalPlayers = mode;
        if (mode === 2) activeColors = ['red', 'yellow'];
        if (mode === 3) activeColors = ['red', 'green', 'yellow'];
        if (mode === 4) activeColors = ['red', 'green', 'yellow', 'blue'];
    }

    ['red', 'green', 'yellow', 'blue'].forEach(c => {
        for(let i=0; i<4; i++) {
            document.getElementById(c[0] + i).style.display = activeColors.includes(c) ? 'block' : 'none';
        }
        let diceContainer = document.getElementById(`dice-container-${c}`);
        if(diceContainer) {
            diceContainer.style.display = activeColors.includes(c) ? 'flex' : 'none';
            document.getElementById(`dice-img-${c}`).src = "dice1.png";
        }
    });

    showMainMenuUI(false);
    resetGameState();
}

function resetGameState() {
    if(rollInterval) clearInterval(rollInterval);
    if(moveInterval) clearInterval(moveInterval);
    if(animationFrameId) cancelAnimationFrame(animationFrameId);
    
    const vicScreen = document.getElementById('victory-screen');
    if(vicScreen) vicScreen.remove();

    const canvas = document.getElementById('confetti-canvas');
    if(canvas) canvas.remove();
    
    turnIndex = 0;
    turn = activeColors[0];
    isRolling = false;
    waitingForMove = false;
    sixCount = 0;
    
    positions = {
        red: [-1, -1, -1, -1],
        green: [-1, -1, -1, -1],
        yellow: [-1, -1, -1, -1],
        blue: [-1, -1, -1, -1]
    };
    
    document.querySelectorAll('.pawn').forEach(p => {
        p.style.transform = "scale(1)";
        p.classList.remove('selectable', 'pawn-moving');
    });

    ['red', 'green', 'yellow', 'blue'].forEach(c => {
         for(let i=0; i<4; i++) resetPawn(c, i);
    });

    updateStatusUI();
    arrangePawns();
}

function showMainMenuUI(show) {
    const menu = document.getElementById('main-menu');
    const game = document.getElementById('game-screen');
    if (show) {
        menu.classList.remove('hidden');
        game.classList.add('hidden');
    } else {
        menu.classList.add('hidden');
        game.classList.remove('hidden');
    }
}

function tryRoll(color) {
    if (color !== turn || isRolling || waitingForMove) return;
    rollDice();
}

function rollDice() {
    isRolling = true;
    playSound('roll');
    
    const currentDiceBox = document.getElementById(`dice-${turn}`);
    const currentDiceImg = document.getElementById(`dice-img-${turn}`);
    
    currentDiceBox.classList.add('shaking');
    statusText.innerText = "ROLLING...";

    if(rollInterval) clearInterval(rollInterval);

    let counter = 0;
    rollInterval = setInterval(() => {
        diceValue = Math.floor(Math.random() * 6) + 1;
        currentDiceImg.src = `dice${diceValue}.png`; 
        
        counter++;
        if (counter > 12) {
            clearInterval(rollInterval);
            currentDiceBox.classList.remove('shaking');
            
            if (diceValue === 6) {
                sixCount++;
                if (sixCount === 3) {
                    statusText.innerText = "TOO MANY 6s!";
                    sixCount = 0;
                    setTimeout(switchTurn, 1000);
                    return;
                }
            } else {
                sixCount = 0; 
            }
            checkPossibleMoves();
        }
    }, 50);
}

function checkPossibleMoves() {
    let validPawns = [];
    positions[turn].forEach((pos, index) => {
        if (canMove(pos, diceValue)) validPawns.push(index);
    });

    if (validPawns.length === 0) {
        statusText.innerText = "NO MOVES";
        setTimeout(switchTurn, 1000);
    } else if (validPawns.length === 1) {
        // Automatically move if only one choice exists
        setTimeout(() => movePawnLogic(turn, validPawns[0]), 500);
    } else {
        if (gameMode === 'cpu' && turn !== 'red') {
            // CPU automatically picks the best move if multiple exist
            setTimeout(() => cpuPickMove(validPawns), 500);
        } else {
            isRolling = false; 
            waitingForMove = true; 
            statusText.innerText = "PICK A PAWN";
            highlightPawns(validPawns);
        }
    }
}

function cpuPickMove(validPawns) {
    let bestMoveIndex = -1;
    let highestScore = -1000;

    validPawns.forEach(pawnIndex => {
        let score = 0;
        let currentPos = positions[turn][pawnIndex];
        let nextPosIndex = (currentPos === -1) ? 0 : currentPos + diceValue;
        
        // Priority 1: Winning (Getting to the end)
        if (nextPosIndex === 56) score += 1000; 

        // Priority 2: Killing a rival pawn
        let nextCoord = paths[turn][nextPosIndex];
        let wouldKill = false;
        activeColors.forEach(opponent => {
            if (opponent !== turn) {
                positions[opponent].forEach(oppPos => {
                    if (oppPos !== -1 && oppPos !== 999) {
                        let enemyCoord = paths[opponent][oppPos];
                        if (enemyCoord.x === nextCoord.x && enemyCoord.y === nextCoord.y) {
                            wouldKill = true;
                        }
                    }
                });
            }
        });
        if (wouldKill) score += 500;

        // Priority 3: Opening a new pawn (Getting out of home)
        if (currentPos === -1 && diceValue === 6) score += 300;

        // Priority 4: General progress
        score += nextPosIndex; 

        // Add small randomness so it doesn't always pick the same pawn
        score += Math.random() * 10;

        if (score > highestScore) {
            highestScore = score;
            bestMoveIndex = pawnIndex;
        }
    });

    // Execute the best move automatically
    setTimeout(() => movePawnLogic(turn, bestMoveIndex), 500);
}

function canMove(currentPos, steps) {
    if (currentPos === 999) return false; 
    if (currentPos === -1) return steps === 6; 
    return (currentPos + steps) < 57; 
}

function handlePawnClick(color, index) {
    if (turn !== color || !waitingForMove) return;
    if (canMove(positions[color][index], diceValue)) {
        clearHighlights();
        waitingForMove = false;
        isRolling = true;
        movePawnLogic(color, index);
    }
}

function movePawnLogic(player, index) {
    let currentPath = paths[player];
    let pawnEl = document.getElementById(player[0] + index);
    if(moveInterval) clearInterval(moveInterval);

    if (positions[player][index] === -1) {
        positions[player][index] = 0;
        moveVisual(pawnEl, currentPath[0]);
        arrangePawns();
        statusText.innerText = "UNLOCKED!";
        finishTurn(true);
    } else {
        let startStep = positions[player][index];
        let stepsToMove = diceValue;
        let counter = 0;
        
        moveInterval = setInterval(() => {
            counter++;
            let nextStep = startStep + counter;
            
            if (nextStep >= 56) {
                positions[player][index] = 999; 
                clearInterval(moveInterval);
                arrangePawns();
                playSound('win');
                statusText.innerText = `${player.toUpperCase()} HOME!`;
                if (!checkVictory(player)) finishTurn(true); 
                return; 
            }

            positions[player][index] = nextStep;
            moveVisual(pawnEl, currentPath[nextStep]);

            if (counter === stepsToMove) {
                clearInterval(moveInterval);
                let killed = checkKill(player, nextStep);
                arrangePawns();
                finishTurn(killed || diceValue === 6);
            }
        }, 200);
    }
}

function finishTurn(bonusTurn) {
    if (bonusTurn) {
        statusText.innerText = "BONUS ROLL!";
        isRolling = false;
        if (gameMode === 'cpu' && turn !== 'red') setTimeout(rollDice, 1000); 
    } else {
        setTimeout(switchTurn, 500);
    }
}

function switchTurn() {
    sixCount = 0; 
    turnIndex = (turnIndex + 1) % activeColors.length;
    turn = activeColors[turnIndex];
    waitingForMove = false;
    isRolling = false; 
    updateStatusUI();
    
    if(positions[turn].every(p => p === 999)) {
        switchTurn(); 
        return;
    }
    if (gameMode === 'cpu' && turn !== 'red') setTimeout(rollDice, 1000);
}

function checkKill(attacker, stepIndex) {
    let landingCoord = paths[attacker][stepIndex];
    const safeZones = [{x:1, y:6}, {x:13, y:8}, {x:8, y:1}, {x:6, y:13}, {x:6, y:2}, {x:12, y:6}, {x:8, y:12}, {x:2, y:8}];
    if (safeZones.some(z => z.x === landingCoord.x && z.y === landingCoord.y)) return false;

    let killFound = false;
    activeColors.forEach(opponent => {
        if (opponent === attacker) return;
        for (let i = 0; i < 4; i++) {
            let pos = positions[opponent][i];
            if (pos !== -1 && pos !== 999) {
                let enemyCoord = paths[opponent][pos];
                if (enemyCoord.x === landingCoord.x && enemyCoord.y === landingCoord.y) {
                    playSound('win');
                    statusText.innerText = `KILLED ${opponent.toUpperCase()}!`;
                    resetPawn(opponent, i);
                    killFound = true;
                }
            }
        }
    });
    return killFound;
}

function resetPawn(color, index) {
    positions[color][index] = -1;
    let pawn = document.getElementById(color[0] + index);
    if(pawn) {
        pawn.style.top = homes[color][index].top;
        pawn.style.left = homes[color][index].left;
        pawn.style.transform = "scale(1)";
    }
}

function moveVisual(pawn, coord) {
    if(!pawn || !coord) return; 
    playSound('step');
    const stepSize = 6.66;
    pawn.style.left = (coord.x * stepSize + 0.1) + '%';
    pawn.style.top  = (coord.y * stepSize - 0.1) + '%';
    pawn.classList.add('pawn-moving');
    setTimeout(() => pawn.classList.remove('pawn-moving'), 150);
}

function arrangePawns() {
    let map = {};
    const winCoords = { red: {x: 6.15, y: 7}, green: {x: 7, y: 6.15}, yellow: {x: 7.85, y: 7}, blue: {x: 7, y: 7.85} };

    activeColors.forEach(color => {
        for(let i=0; i<4; i++) {
            let pos = positions[color][i];
            if (pos !== -1 && pos !== 999) {
                let coord = paths[color][pos];
                let key = `${coord.x},${coord.y}`;
                if (!map[key]) map[key] = [];
                map[key].push({ id: color[0]+i, type: 'active' });
            } else if (pos === 999) {
                let coord = winCoords[color];
                let key = `${coord.x},${coord.y}`;
                if (!map[key]) map[key] = [];
                map[key].push({ id: color[0]+i, type: 'win' });
            }
        }
    });
    
    const stepSize = 6.66;
    for (let key in map) {
        let pawns = map[key];
        let [x, y] = key.split(',').map(Number);
        pawns.forEach((p, i) => {
            let el = document.getElementById(p.id);
            if(el) {
                el.style.left = (x * stepSize + 0.1) + '%';
                el.style.top  = (y * stepSize - 0.1) + '%';
                el.style.transform = p.type === 'win' ? 'scale(0.55)' : (pawns.length > 1 ? 'scale(0.65)' : 'scale(1)');
            }
        });
    }
}

function updateStatusUI() {
    document.querySelectorAll('.dice-btn').forEach(d => d.classList.remove('dice-active'));
    let activeDice = document.getElementById(`dice-${turn}`);
    if(activeDice) activeDice.classList.add('dice-active');
    statusText.innerText = turn.toUpperCase() + "'S TURN";
    const colors = { red: '#ff4757', green: '#2ecc71', yellow: '#f1c40f', blue: '#3498db' };
    statusText.style.color = colors[turn];
}

function highlightPawns(indices) {
    indices.forEach(i => document.getElementById(turn[0] + i).classList.add('selectable'));
}

function clearHighlights() {
    document.querySelectorAll('.selectable').forEach(el => el.classList.remove('selectable'));
}

function toggleSound() { 
    isSoundOn = !isSoundOn; 
    document.getElementById('sound-btn').style.opacity = isSoundOn ? 1 : 0.5; 
}

function playSound(name) { 
    if (isSoundOn && sounds[name]) { 
        sounds[name].currentTime = 0; 
        sounds[name].play().catch(() => {}); 
    } 
}

function togglePauseMenu() {
    document.getElementById('pause-modal').classList.toggle('hidden');
}

function toggleFullScreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
}

function checkVictory(player) {
    if (positions[player].every(p => p === 999)) {
        isRolling = false;
        playSound('win');
        alert(player.toUpperCase() + " WINS!");
        location.reload();
        return true; 
    }
    return false;
}

function restartGame() { location.reload(); }
function quitGame() { location.reload(); }
