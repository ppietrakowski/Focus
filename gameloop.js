
import { Ai, RandomPlayer } from './ai.js';
import { EventEmitterObj } from './eventemmiter3.js'
import { checkForVictoryCondition, countPlayerFields, CURRENT_PLAYER_INDEX, isCurrentPlayerControlledByPlayer, PLAYER_GREEN, PLAYER_RED, switchToNextPlayer, WINNER_PLAYER_INDEX } from './gameboard.js';
import { clearAllBoard, GUI_EVENTS, playerMustPlace, updateReserve } from './gui.js';
import { board } from './index.js';

export let isAvailableForMove = false;
let _ais = [null, null];
let _board = null;


export function setAvailableForMove() {
    isAvailableForMove = true;
}

export function initializeGameLoop(board, ai0, ai1) {
    _ais[PLAYER_RED] = ai0;
    _ais[PLAYER_GREEN] = ai1;

    _board = board;
    clearAllBoard();
    updateReserve();

    if (!isCurrentPlayerControlledByPlayer(_board)) {
        isAvailableForMove = true;
    }

    requestAnimationFrame(animationRequestHack);
}

var gameEnded = false;

export const GAMELOOP_EVENTS = new EventEmitterObj();

function animationRequestHack(time) {
    if (!gameEnded) {
        requestAnimationFrame(animationRequestHack);
    }

    if (isAvailableForMove) {
        if (!isCurrentPlayerControlledByPlayer(_board)) {
            _ais[_board[CURRENT_PLAYER_INDEX]].move();
            clearAllBoard();
            updateReserve();
            switchToNextPlayer(_board);
            isAvailableForMove = false;

            if (!isCurrentPlayerControlledByPlayer(_board[CURRENT_PLAYER_INDEX])) {
                isAvailableForMove = true;
                return;
            }

            return;
        } else {
            switchToNextPlayer(_board);

            if (!isCurrentPlayerControlledByPlayer(_board[CURRENT_PLAYER_INDEX])) {
                isAvailableForMove = true;
                return;
            }
        }

        isAvailableForMove = false;
    }

    if (checkForVictoryCondition(_board)) {
        alert(`Winner is ${_board[WINNER_PLAYER_INDEX]}`);
        gameEnded = true;
    }
}
