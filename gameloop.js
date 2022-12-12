
import { Ai, RandomPlayer } from './ai.js';
import {EventEmitterObj} from './eventemmiter3.js'
import { CURRENT_PLAYER_INDEX, isCurrentPlayerControlledByPlayer, PLAYER_GREEN, PLAYER_RED, switchToNextPlayer } from './gameboard.js';
import { clearAllBoard, GUI_EVENTS, updateReserve } from './gui.js';
import { board } from './index.js';

let isAvailableForMove = false;
let _ais = [null, null];
let _board = null;


export function setAvailableForMove() {
    isAvailableForMove = true;
}

export function initializeGameLoop(board, ai0, ai1) {
    _ais[PLAYER_RED] = ai0;
    _ais[PLAYER_GREEN] = ai1;

    _board = board;

    requestAnimationFrame(animationRequestHack);
}

export const GAMELOOP_EVENTS = new EventEmitterObj();

function animationRequestHack(time) {
    requestAnimationFrame(animationRequestHack);

    if (isAvailableForMove) {
        if (!isCurrentPlayerControlledByPlayer(_board)) {
            _ais[_board[CURRENT_PLAYER_INDEX]].move();
            clearAllBoard();
            updateReserve();
            switchToNextPlayer(_board);
        } else {
            isAvailableForMove = false;
            switchToNextPlayer(_board);
        }

        if (!isCurrentPlayerControlledByPlayer(_board)) {
            _ais[_board[CURRENT_PLAYER_INDEX]].move();
            clearAllBoard();
            updateReserve();
            switchToNextPlayer(_board);
        } else {
            isAvailableForMove = false;
            switchToNextPlayer(_board);
        }
    }
}