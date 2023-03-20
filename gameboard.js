import { cloneField, Field, FIELD_STATE_GREEN, FIELD_STATE_RED, FIELD_STATE_UNPLAYABLE } from "./field.js";
import { Board } from "./board.js";

export const PLAYER_RED = FIELD_STATE_RED;
export const PLAYER_GREEN = FIELD_STATE_GREEN;
export const PLAYER_TYPE_NORMAL = 0;
export const PLAYER_TYPE_AI = 1;
export const NO_WINNER = -1;

export function Statistics(winrate, visits, children, parent) {
    this.winrate = winrate;
    this.visits = visits;
    this.children = children;
    this.parent = parent;
    this.moves = [];
}

export function GameBoard() {
    this.fields = [[new Field(0, 0, 0)]];
    this.currentPlayer = PLAYER_RED;
    this.stats = new Statistics(0, 0, [], {});
    this.winner = -1;
    this.reserve = [];
    this.reserve[PLAYER_RED] = 0;
    this.reserve[PLAYER_GREEN] = 0;
    this.overgrownCallback = this.increasePoolOnOvergrown.bind(this);
}

GameBoard.playersType = [PLAYER_TYPE_NORMAL, PLAYER_TYPE_NORMAL, PLAYER_TYPE_NORMAL, PLAYER_TYPE_NORMAL];
GameBoard.players = [PLAYER_RED, PLAYER_GREEN];

GameBoard.fromJSON = function () {
    const gameBoard = new GameBoard();
    const fields = gameBoard.fields;

    for (let y = 0; y < 8; y++) {
        fields[y] = [];

        for (let x = 0; x < 8; x++) {
            const element = Board.elements.find(e => e.id === y + 8 * x);
            fields[y][x] = new Field(element.state, x, y);

            fields[y][x].onOvergrown = gameBoard.overgrownCallback;
        }
    }

    return gameBoard;
}

GameBoard.prototype.getFieldAt = function(x, y) {
    return this.fields[y][x];
}

GameBoard.prototype.isCurrentPlayerControlledByPlayer = function () {
    return GameBoard.playersType[this.currentPlayer] == PLAYER_TYPE_NORMAL;
}

GameBoard.prototype.filterGameboardFields = function (predicate) {
    const elements = [];

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if (predicate(this.fields[y][x])) {
                elements.push(this.fields[y][x]);
            }
        }
    }

    return elements;
}

GameBoard.prototype.getMovesFromField = function (x, y) {
    const field = this.fields[y][x];
    const height = field.getFieldHeight();
    const moves = [];

    for (let i = 1; i <= height; i++) {
        if (field.posX - i >= 0 && this.fields[y][x - i].fieldState !== FIELD_STATE_UNPLAYABLE) {
            moves.push({ x: -i, y: 0 });
        }

        if (field.posX + i < 8 && this.fields[y][x + i].fieldState !== FIELD_STATE_UNPLAYABLE) {
            moves.push({ x: i, y: 0 });
        }

        if (field.posY - i >= 0 && this.fields[field.posY - i][x].fieldState !== FIELD_STATE_UNPLAYABLE) {
            moves.push({ x: 0, y: -i });
        }

        if (field.posY + i < 8 && this.fields[field.posY + i][x].fieldState !== FIELD_STATE_UNPLAYABLE) {
            moves.push({ x: 0, y: i });
        }
    }

    return moves;
}

GameBoard.setPlayerType = function (name, type) {
    if (type !== PLAYER_TYPE_NORMAL && type !== PLAYER_TYPE_AI) {
        throw Error('Wrong player type supplied !');
    }

    if (name === 'red') {
        GameBoard.playersType[PLAYER_RED] = type;
    } else if (name === 'green') {
        GameBoard.playersType[PLAYER_GREEN] = type;
    } else {
        throw Error('Invalid player name supplied !');
    }
}

GameBoard.prototype.increasePoolOnOvergrown = function (field, poppedState) {
    if (poppedState === FIELD_STATE_RED && field.fieldState === FIELD_STATE_RED) {
        this.reserve[PLAYER_RED] += 1;
    }

    if (poppedState === FIELD_STATE_GREEN && field.fieldState === FIELD_STATE_GREEN) {
        this.reserve[PLAYER_GREEN] += 1;
    }
}

GameBoard.prototype.getPlayerReserve = function (player) {
    if (!GameBoard.players.find(v => v === player)) {
        throw Error('passed something that is not player');
    }

    const reserve = this.reserve[player];

    return reserve;
}

GameBoard.prototype.getWinner = function () {
    return this.winner;
}

GameBoard.prototype.doesAnyoneWin = function () {
    return this.winner !== NO_WINNER;
}

GameBoard.prototype.clone = function () {
    const gameboard = new GameBoard();

    for (let y = 0; y < 8; y++) {
        gameboard.fields[y] = [];

        for (let x = 0; x < 8; x++) {
            gameboard.fields[y][x] = cloneField(this.fields[y][x]);
            gameboard.fields[y][x].onOvergrown = gameboard.overgrownCallback;
        }
    }

    gameboard.reserve = JSON.parse(JSON.stringify(this.reserve));
    gameboard.winner = NO_WINNER;
    gameboard.currentPlayer = this.currentPlayer;
    return gameboard;
}

GameBoard.prototype.countPlayerFields = function (whichPlayer) {
    let count = this.fields.reduce(
        (current, row) =>
            current +
            row.filter(field => field.fieldState === whichPlayer).length, 0);

    return count;
}

GameBoard.prototype.moveInGameboard = function (x, y, toX, toY, player) {
    const fromField = this.fields[y][x];

    if (fromField.fieldState !== player) {
        return false;
    }

    const toField = this.fields[toY][toX];

    if (toField.fieldState === FIELD_STATE_UNPLAYABLE) {
        return false;
    }

    fromField.moveToField(toField);
    return true;
}

GameBoard.prototype.placeAtGameBoard = function (x, y, player) {
    const f = this.fields[y][x];

    if (f.fieldState === FIELD_STATE_UNPLAYABLE) {
        return;
    }

    f.placeAtTop(player);

    this.reserve[player] -= 1;
}

GameBoard.prototype.checkForVictory = function (player) {
    const count = this.countPlayerFields(player);

    if (count === 0 && this.getPlayerReserve(player) === 0) {
        this.currentPlayer = this.getNextPlayer(player);
    }

    return this.winner !== NO_WINNER;
}

GameBoard.prototype.checkForVictoryCondition = function () {
    this.winner = NO_WINNER;

    if (this.checkForVictory(this.currentPlayer))
        return true;

    if (this.checkForVictory(this.getNextPlayer(this.currentPlayer)))
        return true;

    return false;
}

GameBoard.prototype.switchToNextPlayer = function () {
    this.currentPlayer = this.getNextPlayer(this.currentPlayer);
}

GameBoard.prototype.getNextPlayer = function (player) {
    player = player || this.currentPlayer;

    if (player === PLAYER_RED) {
        return PLAYER_GREEN;
    }
    if (player === PLAYER_GREEN) {
        return PLAYER_RED;
    }

    throw Error('Passed a not player assignable');
}