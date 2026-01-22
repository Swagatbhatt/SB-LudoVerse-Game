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
let animationFrameId = null; // For smooth fireworks

// 0-56: Path Index, -1: Home, 999: Finished
let positions = {
    red: [-1, -1, -1, -1],
    green: [-1, -1, -1, -1],
    yellow: [-1, -1, -1, -1],
    blue: [-1, -1, -1, -1]
};

// ============================================
// 2. ROBUST AUDIO SYSTEM (Offline Optimized)
// ============================================
const sounds = { 
    roll: new Audio('sounds/roll.mp3'), 
    step: new Audio('sounds/step.mp3'), 
    win: new Audio('sounds/win.mp3') 
};

// Preload sounds
Object.values(sounds).forEach(s => s.preload = 'auto');

// Unlock Audio Context (Fix for Android)
document.body.addEventListener('click', function unlockAudio() {
    if(isSoundOn) {
        sounds.roll.play().then(() => {
            sounds.roll.pause();
            sounds.roll.currentTime = 0;
        }).catch(() => {});
    }
}, { once: true });

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

// STATIC PATHS
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

    // Set Visibility
    ['red', 'green', 'yellow', 'blue'].forEach(c => {
        // Pawns
        for(let i=0; i<4; i++) {
            document.getElementById(c[0] + i).style.display = activeColors.includes(c) ? 'block' : 'none';
        }
        // Dice
        let diceContainer = document.getElementById(`dice-container-${c}`);
        if(diceContainer) {
            diceContainer.style.visibility = activeColors.includes(c) ? 'visible' : 'hidden';
            document.getElementById(`dice-val-${c}`).innerText = "Start";
        }
    });

    showMainMenuUI(false);
    resetGameState();
}

function resetGameState() {
    // 1. FORCE CLEAR ALL TIMERS
    if(rollInterval) clearInterval(rollInterval);
    if(moveInterval) clearInterval(moveInterval);
    if(animationFrameId) cancelAnimationFrame(animationFrameId);
    
    // Remove Victory Screen if exists
    const vicScreen = document.getElementById('victory-screen');
    if(vicScreen) vicScreen.remove();

    // Remove Confetti Canvas if exists
    const canvas = document.getElementById('confetti-canvas');
    if(canvas) canvas.remove();
    
    // 2. RESET VARIABLES
    turnIndex = 0;
    turn = activeColors[0];
    isRolling = false;
    waitingForMove = false;
    sixCount = 0;
    
    // 3. RESET POSITIONS
    positions = {
        red: [-1, -1, -1, -1],
        green: [-1, -1, -1, -1],
        yellow: [-1, -1, -1, -1],
        blue: [-1, -1, -1, -1]
    };
    
    // 4. RESET VISUALS
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
    const pause = document.getElementById('pause-modal');
    if (show) {
        menu.classList.remove('hidden');
        game.classList.add('hidden');
        pause.classList.add('hidden');
    } else {
        menu.classList.add('hidden');
        game.classList.remove('hidden');
        pause.classList.add('hidden');
    }
}

// ------------------------------------
// DICE LOGIC
// ------------------------------------
function tryRoll(color) {
    if (color !== turn) return;
    if (isRolling) return; 
    if (waitingForMove) return; 
    
    rollDice();
}

function rollDice() {
    isRolling = true;
    playSound('roll');
    
    const currentDiceBox = document.getElementById(`dice-${turn}`);
    const currentDiceVal = document.getElementById(`dice-val-${turn}`);
    
    currentDiceBox.classList.add('shaking');
    statusText.innerText = "ROLLING...";

    if(rollInterval) clearInterval(rollInterval);

    let counter = 0;
    rollInterval = setInterval(() => {
        // --- 3x SIX PREVENTION ---
        if (sixCount >= 2) {
             diceValue = Math.floor(Math.random() * 5) + 1; // Force 1-5
        } else {
             diceValue = Math.floor(Math.random() * 6) + 1;
        }
        
        currentDiceVal.innerText = diceValue;
        counter++;
        
        if (counter > 12) {
            clearInterval(rollInterval);
            currentDiceBox.classList.remove('shaking');
            
            // --- CHECK 3 SIXES ---
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
    } 
    else if (validPawns.length === 1) {
        // AUTO MOVE
        if (gameMode === 'cpu' && turn !== 'red') {
            movePawnLogic(turn, validPawns[0]); 
        } else {
            setTimeout(() => movePawnLogic(turn, validPawns[0]), 500);
        }
    } 
    else {
        // CHOICE
        if (gameMode === 'cpu' && turn !== 'red') {
            setTimeout(() => cpuPickMove(validPawns), 500);
        } else {
            isRolling = false; 
            waitingForMove = true; 
            statusText.innerText = "PICK A PAWN";
            highlightPawns(validPawns);
        }
    }
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
        isRolling = true; // Lock input
        movePawnLogic(color, index);
    }
}

// ------------------------------------
// MOVEMENT LOGIC
// ------------------------------------
function movePawnLogic(player, index) {
    let currentPath = paths[player];
    let pawnEl = document.getElementById(player[0] + index);
    
    if(moveInterval) clearInterval(moveInterval);

    // UNLOCK FROM HOME
    if (positions[player][index] === -1) {
        positions[player][index] = 0;
        moveVisual(pawnEl, currentPath[0]);
        arrangePawns();
        statusText.innerText = "UNLOCKED!";
        finishTurn(true); // Bonus turn
    } else {
        // STEP BY STEP MOVE
        let startStep = positions[player][index];
        let stepsToMove = diceValue;
        let counter = 0;
        
        moveInterval = setInterval(() => {
            counter++;
            let nextStep = startStep + counter;
            
            // VICTORY CHECK
            if (nextStep >= 56) {
                positions[player][index] = 999; 
                pawnEl.style.display = 'block'; 
                clearInterval(moveInterval);
                arrangePawns();
                playSound('win');
                statusText.innerText = `${player.toUpperCase()} HOME!`;
                
                let hasWon = checkVictory(player); 
                if (!hasWon) finishTurn(true); 
                return; 
            }

            positions[player][index] = nextStep;
            
            if (nextStep < currentPath.length) {
                moveVisual(pawnEl, currentPath[nextStep]);
            }

            if (counter === stepsToMove) {
                clearInterval(moveInterval);
                let killed = checkKill(player, nextStep);
                arrangePawns();
                
                if (killed) {
                    finishTurn(true); // Bonus for Kill
                } else {
                    finishTurn(diceValue === 6); // Bonus for Six
                }
            }
        }, 200);
    }
}

function finishTurn(bonusTurn) {
    if (bonusTurn) {
        statusText.innerText = "BONUS ROLL!";
        if (gameMode === 'cpu' && turn !== 'red') {
             setTimeout(rollDice, 1000); 
        } else {
             isRolling = false; 
        }
    } else {
        sixCount = 0; 
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
    
    // Skip if player already won
    if(positions[turn].every(p => p === 999)) {
        switchTurn(); 
        return;
    }

    if (gameMode === 'cpu' && turn !== 'red') {
        setTimeout(rollDice, 1000);
    }
}

function checkKill(attacker, stepIndex) {
    let attackerPath = paths[attacker];
    let landingCoord = attackerPath[stepIndex];
    const safeZones = [{x:1, y:6}, {x:13, y:8}, {x:8, y:1}, {x:6, y:13}, {x:6, y:2}, {x:12, y:6}, {x:8, y:12}, {x:2, y:8}];
    // Check if safe zone
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
        if(activeColors.includes(color)) pawn.style.display = 'block';
    }
}

function cpuPickMove(validPawns) {
    let bestMoveIndex = -1;
    let highestScore = -1000;

    validPawns.forEach(pawnIndex => {
        let score = 0;
        let currentPos = positions[turn][pawnIndex];
        let nextPosIndex = (currentPos === -1) ? 0 : currentPos + diceValue;
        
        if (nextPosIndex >= paths[turn].length) return; 

        let nextCoord = paths[turn][nextPosIndex];
        if (nextPosIndex === 56) score += 1000; // Finish line

        // Kill Potential
        let kills = false;
        activeColors.forEach(opponent => {
            if (opponent !== turn) {
                for (let i = 0; i < 4; i++) {
                    let oppPos = positions[opponent][i];
                    if (oppPos !== -1 && oppPos !== 999) {
                        let oppCoord = paths[opponent][oppPos];
                        if (oppCoord.x === nextCoord.x && oppCoord.y === nextCoord.y) kills = true;
                    }
                }
            }
        });

        if (kills) score += 200;
        if (currentPos === -1) score += 50; // Unlock
        score += nextPosIndex; // Advance
        score += Math.random() * 10; // Randomness

        if (score > highestScore) {
            highestScore = score;
            bestMoveIndex = pawnIndex;
        }
    });

    movePawnLogic(turn, bestMoveIndex);
}

// ------------------------------------
// UI, AUDIO & FIREWORKS
// ------------------------------------
function moveVisual(pawn, coord) {
    if(!pawn || !coord) return; 
    playSound('step');
    const stepSize = 6.66;
    const offset = 0.1; 
    pawn.style.left = (coord.x * stepSize + offset) + '%';
    pawn.style.top  = (coord.y * stepSize - offset) + '%';
    pawn.classList.add('pawn-moving');
    setTimeout(() => pawn.classList.remove('pawn-moving'), 150);
}

function arrangePawns() {
    let map = {};
    
    // Define exact spots for the Colored Triangles
    const winCoords = {
        red:    {x: 6.15, y: 7},   // Left Triangle
        green:  {x: 7,    y: 6.15}, // Top Triangle
        yellow: {x: 7.85, y: 7},   // Right Triangle
        blue:   {x: 7,    y: 7.85}  // Bottom Triangle
    };

    activeColors.forEach(color => {
        for(let i=0; i<4; i++) {
            let pos = positions[color][i];
            
            // 1. Active Pawns (Walking on board)
            if (pos !== -1 && pos !== 999) {
                let coord = paths[color][pos];
                if(coord) {
                    let key = `${coord.x},${coord.y}`;
                    if (!map[key]) map[key] = [];
                    map[key].push({ id: color[0]+i, type: 'active' });
                }
            }
            
            // 2. Winner Pawns (Go to their Color Triangle)
            else if (pos === 999) {
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
        
        // Layouts for stacking multiple pawns
        const layouts = [
            [], 
            [], 
            [{x:-1.5,y:-1.5}, {x:1.5,y:1.5}], 
            [{x:-1.5,y:-1.5}, {x:1.5,y:-1.5}, {x:0,y:1.5}], 
            [{x:-1.5,y:-1.5}, {x:1.5,y:-1.5}, {x:-1.5,y:1.5}, {x:1.5,y:1.5}] 
        ];
        
        let layout = pawns.length === 1 ? [{x:0,y:0}] : (layouts[pawns.length] || layouts[4]);
        
        pawns.forEach((p, i) => {
            let el = document.getElementById(p.id);
            if(el) {
                let off = layout[i];
                
                el.style.left = (x * stepSize + 0.1 + off.x) + '%';
                el.style.top  = (y * stepSize - 0.1 + off.y) + '%';
                
                // If it is a WINNER pawn, scale it down slightly so 4 fit nicely
                if (p.type === 'win') {
                    el.style.transform = 'scale(0.55)';
                    el.style.zIndex = 50 + i; 
                } else {
                    el.style.transform = pawns.length > 1 ? 'scale(0.65)' : 'scale(1)';
                    el.style.zIndex = 10 + i;
                }
            }
        });
    }
}
function updateStatusUI() {
    ['red', 'green', 'yellow', 'blue'].forEach(c => {
        let diceBox = document.getElementById(`dice-${c}`);
        if(diceBox) diceBox.classList.remove('dice-active');
    });
    
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
        sounds[name].play().catch(() => {}); // Catch prevents crash if user didn't interact yet
    } 
}

// --- OPTIMIZED OFFLINE FIREWORKS (Zero Lag) ---
function startConfetti() {
    // 1. Create Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '9000';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#f1c40f', '#e74c3c', '#8e44ad', '#3498db', '#2ecc71'];

    function createParticle() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            vx: Math.random() * 4 - 2,
            vy: Math.random() * 4 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 5 + 2,
            life: Math.random() * 100 + 100 // Particles eventually die
        };
    }

    for (let i = 0; i < 150; i++) particles.push(createParticle());

    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;

            if (p.life <= 0 || p.y > canvas.height) {
                particles[i] = createParticle(); // Recycle particle
            }
            
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Keep looping smoothly
        animationFrameId = requestAnimationFrame(loop);
    }
    
    loop(); // Start loop
}

function checkVictory(player) {
    if (positions[player].every(p => p === 999)) {
        isRolling = false;
        playSound('win');
        startConfetti(); 
        
        // 1. Define the colors for each player
        const colors = {
            red: '#ff4757',
            green: '#2ecc71',
            yellow: '#f1c40f',
            blue: '#3498db'
        };

        // 2. Get the specific color for the winner
        let winColor = colors[player];

        // 3. Create the Victory Screen with Dynamic Colors
        let modalHtml = `
            <div id="victory-screen" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                
                <h1 style="color:${winColor}; font-size:40px; text-transform:uppercase; margin-bottom:20px; text-shadow: 0 0 1px ${winColor};">
                  👑 ${player} WINS! 👑
                </h1>
                
                <div style="font-size:80px; margin-bottom:20px;">🎇</div>
                
                <button onclick="restartGame()" style="padding:15px 40px; font-size:22px; font-weight:bold; background:${winColor}; border:2px solid #ffff; border-radius:10px; cursor:pointer; color:black; box-shadow: 0 0 10px ${winColor};">
                    PLAY AGAIN
                </button>
            </div>`;
            
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        return true; 
    }
    return false;
}

// ------------------------------------
// MENU CONTROLS
// ------------------------------------
function restartGame() {
    // 1. Close Paused Menu
    document.getElementById('pause-modal').classList.add('hidden');
    
    // 2. Close Victory Screen
    const victoryScreen = document.getElementById('victory-screen');
    if (victoryScreen) victoryScreen.remove();

    // 3. Clear Fireworks
    const canvas = document.getElementById('confetti-canvas');
    if (canvas) canvas.remove();
    
    // 4. Stop the animation frame if it is running
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    // 5. Reset Game Logic 
    resetGameState();
    
    // 6. Force start game to re-initialize player visibility
    startGame(gameMode === 'local' ? totalPlayers : 'cpu');

    statusText.innerText = "GAME RESTARTED";
}

function quitGame() {
    location.reload(); // Go back to main menu
}

function togglePauseMenu() {
    const modal = document.getElementById('pause-modal');
    modal.classList.toggle('hidden');
}