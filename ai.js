import { cloneField, Field } from "./field.js";
import { checkForVictoryCondition, cloneGameBoard, countPlayerFields, CURRENT_PLAYER_INDEX, filterGameboard, getMovesFromField, getNextPlayer, getPlayerReserve, moveInGameboard, placeAtGameBoard, switchToNextPlayer, WINNER_PLAYER_INDEX } from "./gameboard.js";
import { setAvailableForMove } from "./gameloop.js";
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
    constructor(algorithm, ownedPlayer, gameBoard) {
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
        setAvailableForMove();
    }

    mustPlace() {
        const p = getAllPlaceMoves(this.gameBoard, this.ownedPlayer);

        p.sort((a, b) => {
            const aGameBoard = cloneGameBoard(this.gameBoard);
            const bGameBoard = cloneGameBoard(this.gameBoard);
            placeAtGameBoard(aGameBoard, a.x, a.y, this.ownedPlayer);
            placeAtGameBoard(bGameBoard, b.x, b.y, this.ownedPlayer);

            return evaluateMove(bGameBoard, this.ownedPlayer) - evaluateMove(aGameBoard, this.ownedPlayer);
        });

        const move = p[0];

        placeAtGameBoard(this.gameBoard, move.x, move.y, this.ownedPlayer);
        setAvailableForMove();
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

    const yourFields = filterGameboard(board, f => f.fieldState === player)
    const enemyFields = filterGameboard(board, f => f.fieldState !== player)

    controlledByYou = yourFields.length
    controlledByEnemy = enemyFields.length
    const ratio = controlledByYou - (2 * controlledByEnemy)

    const heightOfYourFields = yourFields.reduce((accumulated, current) => accumulated + current.height - 1, 0)
    const heightOfEnemyFields = enemyFields.reduce((accumulated, current) => accumulated + current.height - 1, 0)

    const evalValue = 10 * ratio + 1 * ratioInReserve + 2 * (heightOfYourFields - heightOfEnemyFields)

    return evalValue
}

function hasMeetFinalCondition(gameboard, depth) {
    return checkForVictoryCondition(gameboard) || depth === 0;
}

function onFinalConditionOccured(gameboard, player, maximizingPlayer) {
    if (gameboard[WINNER_PLAYER_INDEX] !== maximizingPlayer) {
        // owned player wins
        const result = -evaluateMove(gameboard, player);
        return result;
    }

    const result = evaluateMove(gameboard, player);
    return result;
}

export class MinMaxPlayer extends AiAlgorithm {

    constructor(mustUseAlphaBetaPrunning) {
        super();

        this.bestMove = null;
        this.gameBoard = null;
        this.depth = 3;
        this.mustUseAlphaBetaPrunning = mustUseAlphaBetaPrunning;
    }

    supplyBestMove(board, player) {
        this.gameBoard = cloneGameBoard(board);
        this.maximizingPlayer = player;

        this.minMax(this.depth, player);
        return this.bestMove;
    }

    minMax(depth, player, alpha = -Infinity, beta = Infinity) {
        if (hasMeetFinalCondition(this.gameBoard, depth)) {
            return onFinalConditionOccured(this.gameBoard, player, this.maximizingPlayer);
        }

        const moves = getAvailableMovesForPlayer(this.gameBoard, player);

        if (moves.length === 0) {
            return evaluateMove(this.gameBoard, player);
        }

        if (this.maximizingPlayer === this.gameBoard[CURRENT_PLAYER_INDEX]) {
            let bestScore = -Infinity;

            for (let move of moves) {
                const backupField = cloneField(this.gameBoard[move.y][move.x]);
                let backupField2 = null;

                if (move.shouldPlaceSomething) {
                    placeAtGameBoard(this.gameBoard, move.x, move.y, player);
                } else {
                    backupField2 = cloneField(this.gameBoard[move.outY][move.outX]);

                    moveInGameboard(this.gameBoard, move.x, move.y, move.outX, move.outY, player);
                }

                player = getNextPlayer(this.gameBoard, player, alpha, beta);
                switchToNextPlayer(this.gameBoard);

                let score = this.minMax(depth - 1, player);
                this.gameBoard[move.y][move.x] = backupField;

                if (!!backupField2) {
                    this.gameBoard[move.outY][move.outX] = backupField2;
                }

                if (bestScore < score) {
                    if (depth === this.depth) {
                        this.bestMove = move;
                        bestScore = score;
                    }
                }

                alpha = Math.max(alpha, score);

                if (this.mustUseAlphaBetaPrunning && alpha >= beta) {
                    break;
                }
            }

            return bestScore;
        } else {
            let bestScore = Infinity;

            for (let move of moves) {
                const backupField = cloneField(this.gameBoard[move.y][move.x]);
                let backupField2 = null;

                if (move.shouldPlaceSomething) {
                    placeAtGameBoard(this.gameBoard, move.x, move.y, player);
                } else {
                    backupField2 = cloneField(this.gameBoard[move.outY][move.outX]);

                    moveInGameboard(this.gameBoard, move.x, move.y, move.outX, move.outY, player);
                }

                player = getNextPlayer(this.gameBoard, player);
                switchToNextPlayer(this.gameBoard);

                let score = this.minMax(depth - 1, player, alpha, beta);
                this.gameBoard[move.y][move.x] = backupField;

                if (!!backupField2) {
                    this.gameBoard[move.outY][move.outX] = backupField2;
                }

                if (bestScore > score) {
                    if (depth === this.depth) {
                        this.bestMove = move;
                        bestScore = score;
                    }
                }

                beta = Math.min(beta, score);

                if (this.mustUseAlphaBetaPrunning && alpha >= beta) {
                    break;
                }
            }

            return bestScore;
        }
    }
}


export class NegaMaxPlayer extends AiAlgorithm {

    constructor(mustUseAlphaBetaPrunning) {
        super();

        this.bestMove = null;
        this.gameBoard = null;
        this.depth = 3;
        this.mustUseAlphaBetaPrunning = mustUseAlphaBetaPrunning;
    }

    supplyBestMove(board, player) {
        this.gameBoard = cloneGameBoard(board);
        this.maximizingPlayer = player;

        this.negamax(this.depth, player);
        return this.bestMove;
    }

    negamax(depth, player, alpha = -Infinity, beta = Infinity, sign = 1) {
        if (hasMeetFinalCondition(this.gameBoard, depth)) {
            return onFinalConditionOccured(this.gameBoard, player, this.maximizingPlayer);
        }

        const moves = getAvailableMovesForPlayer(this.gameBoard, player);

        if (moves.length === 0) {
            return evaluateMove(this.gameBoard, player);
        }

        let bestScore = -Infinity;

        for (let move of moves) {
            const backupField = cloneField(this.gameBoard[move.y][move.x]);
            let backupField2 = null;

            if (move.shouldPlaceSomething) {
                placeAtGameBoard(this.gameBoard, move.x, move.y, player);
            } else {
                backupField2 = cloneField(this.gameBoard[move.outY][move.outX]);

                moveInGameboard(this.gameBoard, move.x, move.y, move.outX, move.outY, player);
            }

            player = getNextPlayer(this.gameBoard, player);
            switchToNextPlayer(this.gameBoard);

            let score = -this.negamax(depth - 1, player, -beta, -alpha, -sign);
            
            this.gameBoard[move.y][move.x] = backupField;

            if (!!backupField2) {
                this.gameBoard[move.outY][move.outX] = backupField2;
            }

            if (score > bestScore) {
                if (depth === this.depth) {
                    this.bestMove = move;
                    bestScore = score;
                }
            }

            alpha = Math.max(alpha, score)

            if (this.mustUseAlphaBetaPrunning && alpha >= beta) {
                break;
            }
        }

        return bestScore;
    }
}