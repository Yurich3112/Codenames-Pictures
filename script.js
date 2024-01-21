const gameBoard = document.getElementById('game-board');
const redScoreDisplay = document.getElementById('red-score');
const blueScoreDisplay = document.getElementById('blue-score');
const timerDisplay = document.getElementById('timer');

const cardTypes = {
    'red': 8,
    'blue': 7,
    'grey': 4,
    'dark': 1
};
let cardDeck = [];
let imageDeck = [];
let redTeamScore = 0;
let blueTeamScore = 0;
let timerInterval;
let time = 60; // Initial time set to 1 minute
let currentTurn = 'red'; // Red team starts first
let auto_timer_run = false; // Flag for automatic timer mode
let timerMode = 'auto'; // Default timer mode
let isTwoMinuteTimerSet = false; // New flag to track 2-minute timer status

document.addEventListener('DOMContentLoaded', () => {
    setMode('auto'); // Set the default mode on page load
    initializeGame(); // Initialize the game which will set the "Press READY to start" message
});


function switchTurn() {
    currentTurn = currentTurn === 'red' ? 'blue' : 'red';
    updateTurnDisplay();
}

document.getElementById('auto-mode-btn').addEventListener('click', function () {
    setMode('auto');
});

document.getElementById('manual-mode-btn').addEventListener('click', function () {
    setMode('manual');
});

function setMode(mode) {
    timerMode = mode;
    document.getElementById('auto-mode-btn').classList.remove('active');
    document.getElementById('manual-mode-btn').classList.remove('active');
    document.getElementById(mode + '-mode-btn').classList.add('active');

    const timerControls = document.querySelector('.timer-container');
    if (mode === 'auto') {
        timerControls.style.display = 'none'; // Hides the timer controls
        time = 60; // Set timer to 1 minute
        updateTimerDisplay();
        auto_timer_run = false; // Reset the ready button flag
    } else {
        timerControls.style.display = 'block'; // Shows the timer controls
        resetTimer(); // Reset timer in manual mode
    }
}

document.getElementById('auto-mode-btn').addEventListener('click', function () {
    setMode('auto');
});

document.getElementById('manual-mode-btn').addEventListener('click', function () {
    setMode('manual');
});
// Set a default mode on page load
setMode('auto');
function declareWinner(team) {
    const turnElement = document.getElementById('turn');
    turnElement.textContent = `${team.toUpperCase()} TEAM WINS!`;
    turnElement.style.color = team === 'red' ? 'red' : 'blue';

    // Disable all cards from being clickable
    const cards = document.getElementsByClassName('card');
    for (let card of cards) {
        card.onclick = null;
    }

    // Stop the timer
    clearInterval(timerInterval);
    timerInterval = null;

    // Optionally, show the New Game button if it's not already visible
    document.getElementById('new-game-btn').style.display = 'block';
}


function checkWinCondition() {
    // Check if red team has won
    if (redTeamScore === cardTypes['red']) {
        declareWinner('red');
        return;  // Return to prevent further execution
    }

    // Check if blue team has won
    if (blueTeamScore === cardTypes['blue']) {
        declareWinner('blue');
        return;  // Return to prevent further execution
    }
}


function updateTurnDisplay() {
    const turnElement = document.getElementById('turn');
    turnElement.textContent = `${currentTurn.toUpperCase()} TEAM'S TURN`;
    turnElement.style.color = currentTurn;
}

function showRules() {
    alert('Show game rules here...');
}

function newGame() {
    initializeGame(); // Initialize the game setup

    // Explicitly set the turn to red team and update the display
    currentTurn = 'red';
}

function showPlayers() {
    alert('Show players information here...');
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
function generateMasterFile() {
    const colorMap = { 'red': '#ff9999', 'blue': '#9999ff', 'grey': '#7f7f7f', 'dark': '#333333' };

    let htmlContent = '<!DOCTYPE html><html><head><style>'
        + '.grid { text-align: center; }'
        + '.card { width: 60px; height: 60px; display: inline-block; margin: 5px; }'
        + '</style></head><body>'
        + '<div class="grid">';

    // Initialize a 4x5 grid
    let grid = Array(4).fill().map(() => Array(5).fill(' '));

    // Populate the grid with the card types
    cardDeck.forEach((type, index) => {
        let rowIndex = Math.floor(index / 5);
        let colIndex = index % 5;
        grid[rowIndex][colIndex] = type;
    });

    // Generate HTML content for the grid
    for (let row = 3; row >= 0; row--) {
        for (let col = 4; col >= 0; col--) {
            let color = colorMap[grid[row][col]];
            htmlContent += `<div class="card" style="background-color: ${color};"></div>`;
        }
        htmlContent += '<br>';
    }

    htmlContent += '</div></body></html>';

    // Create and download the HTML file
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'master_view.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
}



function generateDeck() {
    cardDeck = [];
    imageDeck = [];
    time = 60;
    updateTimerDisplay();
    for (let i = 1; i <= 100; i++) {
        imageDeck.push(`images/${i}.png`);
    }
    shuffleArray(imageDeck);

    for (const type in cardTypes) {
        for (let i = 0; i < cardTypes[type]; i++) {
            cardDeck.push(type);
        }
    }
    shuffleArray(cardDeck);
    // Generate the master file before the deck is emptied
    generateMasterFile();
    gameBoard.innerHTML = '';

    for (let i = 0; i < 20; i++) { // Generate only 20 cards
        const type = cardDeck.pop();
        const imagePath = imageDeck.pop();
        createCard(type, imagePath);
    }

}

function createCard(type, imagePath) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.type = type;
    card.dataset.revealed = 'false'; // Add a revealed data attribute
    card.style.backgroundImage = `url('${imagePath}')`;
    card.onclick = () => revealCard(card);
    gameBoard.appendChild(card);
}


function revealCard(card) {
    const cardType = card.dataset.type;
    if (card.dataset.revealed === 'false') {
        card.textContent = '✓';
        card.style.color = 'transparent';
        setTimeout(() => { card.style.color = 'white'; }, 500);

        switch (cardType) {
            case 'red':
                card.style.backgroundColor = 'red';
                card.style.border = '10px solid #ff9999';
                redTeamScore++;
                redScoreDisplay.textContent = redTeamScore;
                checkWinCondition(); // Check win condition after updating the score
                break;
            case 'blue':
                card.style.backgroundColor = 'blue';
                card.style.border = '10px solid #9999ff';
                blueTeamScore++;  // Increment blue team score
                blueScoreDisplay.textContent = blueTeamScore;
                checkWinCondition(); // Check win condition after updating the score
                break;
            case 'grey':
                card.style.backgroundColor = 'grey';
                card.style.border = '10px solid #7f7f7f';
                break;
            case 'dark':
                card.style.backgroundColor = 'black';
                card.style.border = '10px solid #333333';
                declareWinner(currentTurn === 'red' ? 'blue' : 'red');
                return; // Stop further execution if the game is over
        }

        // Check if the revealed card's type matches the current turn
        if ((cardType !== currentTurn && cardType !== 'dark') || cardType === 'grey') {
            switchTurn();

            // If in auto timer mode, reset and start the 1-minute timer
            if (timerMode === 'auto') {
                time = 60; // Reset timer to 1 minute
                updateTimerDisplay();
                auto_timer_run = false; // Reset the ready button flag
                isTwoMinuteTimerSet = false; // Reset the 2-minute timer flag
                startTimer(); // Automatically start the timer
            }
        }

        if (cardType === 'red' && redTeamScore === cardTypes['red'] || cardType === 'blue' && blueTeamScore === cardTypes['blue']) {
            declareWinner(cardType);
            return; // Stop further execution if the game is over
        }

        card.dataset.revealed = 'true';
    }
}



function formatTime(seconds) {
    const pad = (num) => num.toString().padStart(2, '0');
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    return `${pad(minutes)}:${pad(secs)}`;
}

function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(time);
}

function addTime(seconds) {
    time += seconds;
    updateTimerDisplay();
    startTimer(); // Automatically start the timer when time is added
}

function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    timerInterval = setInterval(() => {
        time--;
        updateTimerDisplay();
        if (time <= 0) {
            clearInterval(timerInterval);
            alert('Time is up!');
            if (timerMode === 'auto') {
                endTurn(); // Automatically end turn when time is up
            }
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    time = 0;
    updateTimerDisplay();
    timerInterval = null;
}

function toggleTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    } else {
        startTimer();
    }
}

function initializeGame() {
    redTeamScore = 0;
    blueTeamScore = 0;
    redScoreDisplay.textContent = '0';
    blueScoreDisplay.textContent = '0';
    isTwoMinuteTimerSet = false; // Reset the 2-minute timer flag

    if (timerMode === 'auto') {
        time = 60; // Set timer to 1 minute
        updateTimerDisplay();
        auto_timer_run = false; // Reset the ready button flag
    }
    // Update the turn display with the new game start message

    resetTimer();
    generateDeck();
    cardDeck.forEach(type => createCard(type));
    document.getElementById('turn').textContent = 'Press READY to start';
    //updateTurnDisplay(); // Call this function to update the turn indicator on the UI
}



// Create a new function to handle "Ready" button press
function readyButtonClicked() {
    updateTurnDisplay(); // Call this function to update the turn indicator on the UI
    if (timerMode === 'auto') {
        if (!auto_timer_run) {
            auto_timer_run = true;
            isTwoMinuteTimerSet = false; // Reset the 2-minute timer flag
            startTimer();
        } else if (!isTwoMinuteTimerSet) {
            time = 120; // Set timer to 2 minutes
            updateTimerDisplay();
            startTimer();
            isTwoMinuteTimerSet = true; // Indicate that 2-minute timer is set
        }
    }
}



document.getElementById('ready-btn').addEventListener('click', readyButtonClicked);

function endTurn() {
    if (timerMode === 'auto') {
        switchTurn(); // Switch turn at the end
        time = 60; // Reset timer to 1 minute for the next team
        updateTimerDisplay();
        auto_timer_run = true; // Reset to allow "Ready" to set 2 minutes
        isTwoMinuteTimerSet = false; // Reset the 2-minute timer flag
        startTimer(); // Automatically start the 1-minute timer for the next team
    }
}

function addPlayer(team) {
    var playerNameInput = document.getElementById(team + '-player-name');
    var playerName = playerNameInput.value.trim();
    if (playerName) {
        var playerList = document.getElementById(team + '-team-players');
        var playerEntry = document.createElement('div');
        playerEntry.textContent = playerName;
        playerList.appendChild(playerEntry);
        playerNameInput.value = ''; // Clear the input field
    } else {
        alert('Please enter a player name.');
    }
    highlightMasters(); // This will highlight the first player in each list
}


document.getElementById('end-turn-btn').addEventListener('click', endTurn);

// A helper function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

// Function to handle shuffling and assigning players to teams
function shufflePlayers() {
    // Get all player names from both teams' lists
    let players = [];
    const redPlayerElements = document.getElementById('red-team-players').children;
    const bluePlayerElements = document.getElementById('blue-team-players').children;

    for (let element of redPlayerElements) {
        players.push(element.textContent);
    }
    for (let element of bluePlayerElements) {
        players.push(element.textContent);
    }

    // Shuffle the array of player names
    shuffleArray(players);
   

    // Clear the current team lists
    document.getElementById('red-team-players').innerHTML = '';
    document.getElementById('blue-team-players').innerHTML = '';

    // Split the players into two teams
    const half = Math.ceil(players.length / 2);
    const teamRed = players.slice(0, half);
    const teamBlue = players.slice(half);

    // Function to add players to the DOM
    const addToTeam = (team, player) => {
        const playerElement = document.createElement('div');
        playerElement.textContent = player;
        document.getElementById(team + '-team-players').appendChild(playerElement);
    };

    // Add the players to the respective team lists in the DOM
    teamRed.forEach(player => addToTeam('red', player));
    teamBlue.forEach(player => addToTeam('blue', player));
    highlightMasters(); // This will highlight the first player in each list
}

// Attach the shufflePlayers function to the "PLAYERS" button
document.querySelector('.button-container button:nth-child(3)').onclick = shufflePlayers;

function highlightMasters() {
    // Remove any existing master highlights
    document.querySelectorAll('.master').forEach(el => el.classList.remove('master'));

    // Highlight the first player in each team as the master
    const redTeamPlayers = document.getElementById('red-team-players').children;
    const blueTeamPlayers = document.getElementById('blue-team-players').children;

    if (redTeamPlayers.length > 0) {
        redTeamPlayers[0].classList.add('master');
    }

    if (blueTeamPlayers.length > 0) {
        blueTeamPlayers[0].classList.add('master');
    }
}

// Initialize the game board and timer display when the page loads
initializeGame();
updateTimerDisplay();
