import { Ai, MinMaxPlayer, MonteCarloSearch, NegaMaxPlayer, RandomPlayer } from "./ai.js";
import { makeGameboardFromJson, PLAYER_GREEN, PLAYER_RED, PLAYER_TYPE_AI, setPlayerType, switchToNextPlayer } from "./gameboard.js";
import { GAMELOOP_EVENTS, initializeGameLoop } from "./gameloop.js";
import { cleanupGui, GUI_EVENTS, initializeGuiForBoard } from "./gui.js";

export const board = makeGameboardFromJson();

// initializeGuiForBoard(board);

// const ai = new Ai(new MonteCarloSearch(), PLAYER_RED, board);

// setPlayerType('red', PLAYER_TYPE_AI);

// initializeGameLoop(board, ai, null);

const playerRedSelect = document.getElementById('player1')
const playerGreenSelect = document.getElementById('player2')
const playerRedDepth = document.getElementById('depthPlayer1');
const playerGreenDepth = document.getElementById('depthPlayer2');

const beginPlay = document.getElementById('BeginPlayButton')

function getAlgorithmForPlayer(option, player) {
    let ai = null;

    if (option === 'random') {
        ai = new Ai(new RandomPlayer(), player, board);
    } else if (option === 'minimax') {
        ai = new Ai(new MinMaxPlayer(), player, board);
    } else if (option === 'negamax') {
        ai = new Ai(new NegaMaxPlayer(), player, board);
    } else if (option === 'abminimax') {
        ai = new Ai(new MinMaxPlayer(true), player, board);
    } else if (option === 'abnegaminimax') {
        ai = new Ai(new NegaMaxPlayer(true), player, board);
    } else if (option === 'monteCarloSearch') {
        ai = new Ai(new MonteCarloSearch(), player, board);
    }

    return ai;
}

playerRedSelect.addEventListener('click', () => {
    if (playerRedSelect.options[playerRedSelect.selectedIndex].value == 'human' ||
        playerRedSelect.options[playerRedSelect.selectedIndex].value == 'random' ||
        playerRedSelect.options[playerRedSelect.selectedIndex].value == 'monteCarloSearch' ||
        playerRedSelect.options[playerRedSelect.selectedIndex].value == 'monteCarloTreeSearch') {
            document.getElementById('depthPlayer1').style.display = 'none';
        }
    else {
        document.getElementById('depthPlayer1').style.display = 'inline';
    }
    console.log(playerRedSelect.options[playerRedSelect.selectedIndex].value);
})

playerGreenSelect.addEventListener('click', () => {
    if (playerGreenSelect.options[playerGreenSelect.selectedIndex].value == 'human' ||
        playerGreenSelect.options[playerRedSelect.selectedIndex].value == 'random' ||
        playerGreenSelect.options[playerGreenSelect.selectedIndex].value == 'monteCarloSearch' ||
        playerGreenSelect.options[playerGreenSelect.selectedIndex].value == 'monteCarloTreeSearch') {
            document.getElementById('depthPlayer2').style.display = 'none';
        }
    else {
        document.getElementById('depthPlayer2').style.display = 'inline';
    }
    console.log(playerRedSelect.options[playerRedSelect.selectedIndex].value);
})

beginPlay.addEventListener('click', () => {
    initializeGuiForBoard(board);

    let redAi = null;
    let greenAi = null;

    if (playerRedSelect.options[playerRedSelect.selectedIndex].value !== 'human') {
        const option = playerRedSelect.options[playerRedSelect.selectedIndex].value;
        redAi = getAlgorithmForPlayer(option, PLAYER_RED);
        setPlayerType('red', PLAYER_TYPE_AI);
    }

    if (playerGreenSelect.options[playerGreenSelect.selectedIndex].value !== 'human') {
        const option = playerGreenSelect.options[playerGreenSelect.selectedIndex].value;
        greenAi = getAlgorithmForPlayer(option, PLAYER_GREEN);
        setPlayerType('green', PLAYER_TYPE_AI);
    }

    const parent = beginPlay.parentElement;

    parent.disabled = true;

    initializeGameLoop(board, redAi, greenAi);
});

