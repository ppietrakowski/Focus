import { cloneField, Field, FIELD_STATE_GREEN, FIELD_STATE_RED, FIELD_STATE_UNPLAYABLE } from "./field.js";
import { Board } from "./board.js";
import { EventEmitterObj } from "./eventemmiter3.js";

export const PLAYER_RED = FIELD_STATE_RED;
export const PLAYER_GREEN = FIELD_STATE_GREEN;
export const PLAYER_TYPE_NORMAL = 0;
export const PLAYER_TYPE_AI = 1;

const players = [PLAYER_RED, PLAYER_GREEN];

let playersType = [PLAYER_TYPE_NORMAL, PLAYER_TYPE_NORMAL, PLAYER_TYPE_NORMAL, PLAYER_TYPE_NORMAL];
let currentPlayer = PLAYER_RED;

export const RED_PLAYER_RESERVE_INDEX = 9;
export const GREEN_PLAYER_RESERVE_INDEX = 10;
export const WINNER_PLAYER_INDEX = 11;
export const FIELD_OVERGROWN_CALLBACK_INDEX = 12;
export const CURRENT_PLAYER_INDEX = 13;
export const EVENTS_INDEX = 14;

const playersReserve = [{}, {}, { player: PLAYER_RED, index: RED_PLAYER_RESERVE_INDEX }, { player: PLAYER_GREEN, index: GREEN_PLAYER_RESERVE_INDEX }];

export function makeGameboardFromJson() {
    const board = [[new Field(0, 0, 0)]];

    board[FIELD_OVERGROWN_CALLBACK_INDEX] = increasePoolOnOvergrown.bind(undefined, board);

    for (let y = 0; y < 8; y++) {
        board[y] = [];

        for (let x = 0; x < 8; x++) {
            const element = Board.elements.find(e => e.id === y + 8 * x);
            board[y][x] = new Field(element.state, x, y);

            board[y][x].onOvergrown = board[FIELD_OVERGROWN_CALLBACK_INDEX];
        }
    }

    board[RED_PLAYER_RESERVE_INDEX] = 0;
    board[GREEN_PLAYER_RESERVE_INDEX] = 0;
    board[WINNER_PLAYER_INDEX] = null;
    board[CURRENT_PLAYER_INDEX] = PLAYER_RED;

    return board;
}

export function isCurrentPlayerControlledByPlayer(board) {
    return playersType[board[CURRENT_PLAYER_INDEX]] === PLAYER_TYPE_NORMAL;
}

export function filterGameboard(board, predicate) {
    const elements = [];

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if (predicate(board[y][x])) {
                elements.push(board[y][x]);
            }
        }
    }

    return elements;
}


export function getMovesFromField(board, x, y) {
    const field = board[y][x];
    const height = field.getFieldHeight();
    const moves = [];

    for (let i = 1; i <= height; i++) {
        if (field.posX - i >= 0 && board[y][x - i].fieldState !== FIELD_STATE_UNPLAYABLE) {
            moves.push({ x: -i, y: 0 });
        }

        if (field.posX + i < 8 && board[y][x + i].fieldState !== FIELD_STATE_UNPLAYABLE) {
            moves.push({ x: i, y: 0 });
        }

        if (field.posY - i >= 0 && board[field.posY - i][x].fieldState !== FIELD_STATE_UNPLAYABLE) {
            moves.push({ x: 0, y: -i });
        }

        if (field.posY + i < 8 && board[field.posY + i][x].fieldState !== FIELD_STATE_UNPLAYABLE) {
            moves.push({ x: 0, y: i });
        }
    }

    return moves;
}

export function setPlayerType(name, type) {
    if (type !== PLAYER_TYPE_NORMAL && type !== PLAYER_TYPE_AI) {
        throw Error('Wrong player type supplied !');
    }

    if (name === 'red') {
        playersType[PLAYER_RED] = type;
    } else if (name === 'green') {
        playersType[PLAYER_GREEN] = type;
    } else {
        throw Error('Invalid player name supplied !');
    }
}

function increasePoolOnOvergrown(board, field, poppedState) {
    if (poppedState === FIELD_STATE_RED && field.fieldState === FIELD_STATE_RED) {
        board[RED_PLAYER_RESERVE_INDEX] += 1;
    }

    if (poppedState === FIELD_STATE_GREEN && field.fieldState === FIELD_STATE_GREEN) {
        board[GREEN_PLAYER_RESERVE_INDEX] += 1;
    }
}

export function getPlayerReserve(board, player) {
    if (!players.find(v => v === player)) {
        throw Error('passed something that is not player');
    }

    const reserve = board[playersReserve[player].index];

    return reserve;
}

export function getWinner(board) {
    return board[WINNER_PLAYER_INDEX];
}

export function cloneGameBoard(board) {
    const tempBoard = [[new Field(0, 0, 0)]];

    tempBoard[FIELD_OVERGROWN_CALLBACK_INDEX] = increasePoolOnOvergrown.bind(undefined, tempBoard);


    for (let y = 0; y < 8; y++) {
        tempBoard[y] = [];

        for (let x = 0; x < 8; x++) {
            tempBoard[y][x] = cloneField(board[y][x]);
            tempBoard[y][x].onOvergrown = tempBoard[FIELD_OVERGROWN_CALLBACK_INDEX];
        }
    }

    tempBoard[RED_PLAYER_RESERVE_INDEX] = board[RED_PLAYER_RESERVE_INDEX];
    tempBoard[GREEN_PLAYER_RESERVE_INDEX] = board[GREEN_PLAYER_RESERVE_INDEX];
    tempBoard[WINNER_PLAYER_INDEX] = null;
    tempBoard[CURRENT_PLAYER_INDEX] = board[CURRENT_PLAYER_INDEX];

    return tempBoard;
}


/**
 * 
 * @param {Field[][]} board 
 * @param {*} whichPlayer 
 */
export function countPlayerFields(board, whichPlayer) {
    let count = 0;

    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            if (board[x][y].fieldState === whichPlayer) {
                count++;
            }
        }
    }

    return count;
}

export function moveInGameboard(board, x, y, toX, toY, player) {
    const fromField = board[y][x];

    if (fromField.fieldState !== player) {
        return false;
    }

    const toField = board[toY][toX];

    if (toField.fieldState === FIELD_STATE_UNPLAYABLE) {
        return false;
    }

    fromField.moveToField(toField);
    return true;
}

export function placeAtGameBoard(board, x, y, player) {
    const f = board[y][x];

    f.placeAtTop(player);

    board[playersReserve[player].index] -= 1;
}

function checkForVictory(board, player) {
    const count = countPlayerFields(board, player);

    if (count === 0 && getPlayerReserve(board, player) === 0) {
        board[WINNER_PLAYER_INDEX] = getNextPlayer(board, player);
    }

    return board[WINNER_PLAYER_INDEX] !== null;
}

export function checkForVictoryCondition(board) {
    board[WINNER_PLAYER_INDEX] = null;

    if (checkForVictory(board, currentPlayer))
        return true;

    if (checkForVictory(board, getNextPlayer(board, currentPlayer)))
        return true;

    return false;
}

export function switchToNextPlayer(board) {
    board[CURRENT_PLAYER_INDEX] = getNextPlayer(board, board[CURRENT_PLAYER_INDEX]);
}

export function getNextPlayer(board, player) {
    player = player || board[CURRENT_PLAYER_INDEX];

    if (player === PLAYER_RED) {
        return PLAYER_GREEN;
    }
    if (player === PLAYER_GREEN) {
        return PLAYER_RED;
    }

    throw Error('Passed a not player assignable');
}