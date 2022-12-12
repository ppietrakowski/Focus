import { Field } from "./field.js";
import { cloneGameBoard, countPlayerFields, filterGameboard, getMovesFromField, getNextPlayer, getPlayerReserve, moveInGameboard, placeAtGameBoard } from "./gameboard.js";
import { board } from "./index.js";

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
        return { x: f.posX, y: f.posY, moves: getMovesFromField(board, f.posX, f.posY) };
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

function evaluateMove(board, player) {
    let controlledByYou = 0

    let controlledByEnemy = 0

    let controlledInReserveByYou = 0
    let controlledInReserveByEnemy = 0

    controlledInReserveByYou = getPlayerReserve(board, player);
    controlledInReserveByEnemy = getPlayerReserve(board, getNextPlayer(board, player));

    let ratioInReserve = controlledInReserveByYou - controlledInReserveByEnemy
    if (Number.isNaN(ratioInReserve))
        ratioInReserve = 0.0

    const yourFields = filterGameboard(board, f => player.doesOwnThisField(f))
    const enemyFields = filterGameboard(board, f => game.getNextPlayer(player).doesOwnThisField(f))

    controlledByYou = yourFields.length
    controlledByEnemy = enemyFields.length
    const ratio = controlledByYou - (2 * controlledByEnemy)

    const heightOfYourFields = yourFields.reduce((accumulated, current) => accumulated + current.height - 1, 0)
    const heightOfEnemyFields = enemyFields.reduce((accumulated, current) => accumulated + current.height - 1, 0)

    const evalValue = 10 * ratio + 1 * ratioInReserve + 2 * (heightOfYourFields - heightOfEnemyFields)

    return evalValue
}

export class MinMaxPlayer extends AiAlgorithm {

    constructor () {
        this.bestMove = null;
        this.gameBoard = null;
    }

    supplyBestMove(board, player) {
        this.gameBoard = cloneGameBoard(board);
        this.maximizingPlayer = player;

        this.minMax(3, player);

        return this.bestMove;
    }

    minMax(depth, player) {
        if (countPlayerFields(this.gameBoard, player) === 0 || countPlayerFields(this.gameBoard, getNextPlayer(board, player)) || depth === 0) {
            if (countPlayerFields(this.gameBoard, player) === 0) {
                // owned player wins
                const result = -evaluateMove(this.gameBoard, player)
                return result
            }

            const result = evaluateMove(this.gameBoard, player,)
            return result
        }

        const moves = getAvailableMovesForPlayer(this.gameBoard, player);
        
        if (moves.length === 0) {
            return evaluateMove(this.gameBoard, player);
        }

        if (this.maximizingPlayer === player) {
            
        }
    }
}