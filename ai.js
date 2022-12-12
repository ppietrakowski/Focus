import { Field } from "./field.js";
import { filterGameboard, getMovesFromField, getNextPlayer, getPlayerReserve, moveInGameboard, placeAtGameBoard } from "./gameboard.js";

/**
 * 
 * @param {Field[][]} board 
 * @param {number} x 
 * @param {number} y 
 * @param {number} outX 
 * @param {number} outY 
 * @param {boolean} shouldPlaceSomething 
 */
export function AiMove(board, x, y, outX, outY, shouldPlaceSomething) {
    this.x = x;
    this.y = y;
    this.outX = outX;
    this.outY = outY;
    this.shouldPlaceSomething = shouldPlaceSomething;
}

export class AiAlgorithm {

    supplyBestMove(board, player) {
        return new AiMove(board, 0, 0, 1, 1, false);
    }
}


export class Ai {
    /**
     * 
     * @param {AiAlgorithm} algorithm 
     * @param {*} ownedPlayer 
     * @param {Field[][]} gameBoard 
     */
    constructor (algorithm, ownedPlayer, gameBoard) {
        this.algorithm = algorithm;
        this.ownedPlayer = ownedPlayer;
        this.gameBoard = gameBoard;
    }

    move() {
        const move = this.algorithm.supplyBestMove(this.gameBoard, this.ownedPlayer);

        if (move.shouldPlaceSomething) {
            placeAtGameBoard(this.gameBoard, move.x, move.y, this.ownedPlayer);
            return;
        }

        moveInGameboard(this.gameBoard, move.x, move.y, move.outX, move.outY, this.ownedPlayer);
    }
}

/**
 * 
 * @param {Field[][]} board 
 * @param {number} player
 * @returns {AiMove[]} 
 */
function getAvailableMovesForPlayer(board, player) {
    const yourFields = filterGameboard(board, f => f.fieldState === player);

    const fieldsWithMoves = yourFields.flatMap(f => {
        return {x: f.posX, y: f.posY, moves: getMovesFromField(board, f.posX, f.posY)};
       });

    let moves = [];

    for (let field of yourFields) {
        const move = fieldsWithMoves.find(move => move.x === field.posX && move.y === field.posY);

        for (let i = 0; i < move.moves.length; i++) {
            moves.push(new AiMove(board, move.x, move.y, move.x + move.moves[i].x, move.y + move.moves[i].y, false));
        }
    }

    if (getPlayerReserve(board, player) > 0) {
        const enemyFields = filterGameboard(board, f => f.fieldState !== player);

        for (let i = 0; i < enemyFields.length; i++) {
            moves.push(new AiMove(board, enemyFields[i].posX, enemyFields[i].posY, 0, 0, true));
        }
        console.log(moves);
    }

    return moves;
}

function getAllPlaceMoves(board, player) {
    let moves = [];

    if (getPlayerReserve(board, player) > 0) {
        const enemyFields = filterGameboard(board, f => f.fieldState !== player);

        for (let i = 0; i < enemyFields.length; i++) {
            moves.push(new AiMove(board, enemyFields[i].posX, enemyFields[i].posY, 0, 0, true));
        }
        console.log(moves);
    }

    return moves;
}

export class RandomPlayer extends AiAlgorithm {
    supplyBestMove(board, player) {
        const moves = getAvailableMovesForPlayer(board, player);

        if (moves.length === 0) {
            throw Error('next player wins');
        }

        const index = Math.floor(Math.random() * moves.length);
        
        return moves[index];
    }
}