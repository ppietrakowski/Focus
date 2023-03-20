
import { EventEmitterObj } from './eventemmiter3.js'
import { GameBoard, PLAYER_GREEN, PLAYER_RED } from './gameboard.js';
import { clearAllBoard, updateReserve } from './gui.js';

export let isAvailableForMove = false;
let _ais = [null, null];
let _board = new GameBoard();

export function setAvailableForMove() {
    isAvailableForMove = true;
}

export function initializeGameLoop(board, ai0, ai1) {
    _ais[PLAYER_RED] = ai0;
    _ais[PLAYER_GREEN] = ai1;

    _board = board;
    clearAllBoard();
    updateReserve();

    if (!_board.isCurrentPlayerControlledByPlayer()) {
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
        if (!_board.isCurrentPlayerControlledByPlayer()) {
            _ais[_board.currentPlayer].move();
            clearAllBoard();
            updateReserve();
            _board.switchToNextPlayer();

            if (_board.checkForVictoryCondition()) {
                alert(`Winner is ${_board.winner}`);
                gameEnded = true;
                document.location.reload(true);
                return;
            }

            if (!_board.isCurrentPlayerControlledByPlayer()) {
                isAvailableForMove = true;
                return;
            }
            isAvailableForMove = false;

            return;
        } else {
            _board.switchToNextPlayer();

            if (!_board.isCurrentPlayerControlledByPlayer()) {
                isAvailableForMove = true;
                return;
            }
        }

        isAvailableForMove = false;
    }

    if (_board.checkForVictoryCondition()) {
        alert(`Winner is ${_board.winner}`);
        gameEnded = true;
        document.location.reload(true);
    }
}
