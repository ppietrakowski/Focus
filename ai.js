import { cloneField, Field, FIELD_STATE_EMPTY } from "./field.js";
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

var chartConfig = {
    chart: {
        container: "#tree-simple"
    },
    nodeStructure: {
        children: [],
        text: 'ai'
    }
};

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
        } else {
            moveInGameboard(this.gameBoard, move.x, move.y, move.outX, move.outY, this.ownedPlayer);
        }

        chartConfig.nodeStructure = this.algorithm.rootNode;
        console.log('drawing chart');

        if (!(this.algorithm instanceof RandomPlayer) && this.algorithm.rootNode) {
            const treant = new Treant(chartConfig);
        }

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
    const ratio = (controlledByYou - controlledByEnemy) ^ (1.4)

    const heightOfYourFields = yourFields.reduce((accumulated, current) => accumulated + current.getFieldHeight() - 1, 0)
    const heightOfEnemyFields = enemyFields.reduce((accumulated, current) => accumulated + + current.getFieldHeight() - 1, 0)

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

        this.rootNode = {
            text: 'minimax',
            children: []
        };

        const bestScore = this.minMax(this.depth, player, this.rootNode);
        this.rootNode.text = bestScore;
        chartConfig.nodeStructure = this.rootNode;
        console.log(bestScore);

        return this.bestMove;
    }

    minMax(depth, player, rootNode, alpha = -Infinity, beta = Infinity) {
        if (depth === 0) {
            return evaluateMove(this.gameBoard, player);
        }

        if (hasMeetFinalCondition(this.gameBoard, depth)) {
            return onFinalConditionOccured(this.gameBoard, player, this.maximizingPlayer);
        }

        const moves = getAvailableMovesForPlayer(this.gameBoard, player);

        if (moves.length === 0) {
            return evaluateMove(this.gameBoard, player);
        }

        let nodeSize = 0;

        if (this.maximizingPlayer === this.gameBoard[CURRENT_PLAYER_INDEX]) {
            let bestScore = -Infinity;

            for (let move of moves) {
                let childDrawnNode = {
                    text: { name: "MAX " + this.maximizingPlayer + " " + JSON.stringify(move) },
                    children: []
                };

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

                let score = this.minMax(depth - 1, player, childDrawnNode, alpha, beta);
                this.gameBoard[move.y][move.x] = backupField;

                childDrawnNode.text = score.toString();


                player = getNextPlayer(this.gameBoard, player);
                switchToNextPlayer(this.gameBoard);

                if (!!backupField2) {
                    this.gameBoard[move.outY][move.outX] = backupField2;
                }

                if (score > bestScore) {
                    if (depth === this.depth) {
                        this.bestMove = move;
                    }
                    bestScore = score;
                    rootNode.children.push(childDrawnNode);
                }

                alpha = Math.max(alpha, score);

                if (this.mustUseAlphaBetaPrunning && alpha >= beta) {
                    break;
                }
            }


            return bestScore;
        } else {
            let bestScore = Infinity;

            let nodeSize = 0;

            for (let move of moves) {

                let childDrawnNode = {
                    text: { name: "MAX " + this.maximizingPlayer + " " + JSON.stringify(move) },
                    children: []
                };

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

                let score = this.minMax(depth - 1, player, childDrawnNode, alpha, beta);
                this.gameBoard[move.y][move.x] = backupField;

                player = getNextPlayer(this.gameBoard, player);
                switchToNextPlayer(this.gameBoard);

                if (!!backupField2) {
                    this.gameBoard[move.outY][move.outX] = backupField2;
                }

                if (score < bestScore) {
                    if (depth === this.depth) {
                        this.bestMove = move;
                    }
                    bestScore = score;
                    rootNode.children.push(childDrawnNode);
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

        this.rootNode = {
            text: 'minimax',
            children: []
        };



        const bestScore = this.negamax(this.depth, player, this.rootNode);

        this.rootNode.text = bestScore;
        chartConfig.nodeStructure = this.rootNode;
        console.log(bestScore);

        return this.bestMove;
    }

    negamax(depth, player, rootNode, alpha = -Infinity, beta = Infinity, sign = 1) {

        if (depth === 0) {
            return evaluateMove(this.gameBoard, player);
        }

        if (hasMeetFinalCondition(this.gameBoard, depth)) {
            return onFinalConditionOccured(this.gameBoard, player, this.maximizingPlayer);
        }

        const moves = getAvailableMovesForPlayer(this.gameBoard, player);

        if (moves.length === 0) {
            return evaluateMove(this.gameBoard, player);
        }

        let bestScore = -Infinity;

        for (let move of moves) {
            let childDrawnNode = {
                text: { name: "MAX " + this.maximizingPlayer + " " + JSON.stringify(move) },
                children: []
            };

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

            let score = -this.negamax(depth - 1, player, childDrawnNode, -beta, -alpha, -sign);

            player = getNextPlayer(this.gameBoard, player);
            switchToNextPlayer(this.gameBoard);

            this.gameBoard[move.y][move.x] = backupField;

            if (!!backupField2) {
                this.gameBoard[move.outY][move.outX] = backupField2;
            }

            if (score > bestScore) {
                if (depth === this.depth) {
                    this.bestMove = move;
                }
                bestScore = score;
                rootNode.children.push(childDrawnNode);
            }

            alpha = Math.max(alpha, score)

            if (this.mustUseAlphaBetaPrunning && alpha >= beta) {
                break;
            }
        }

        return bestScore;
    }
}

export class MonteCarloSearch extends AiAlgorithm {

    constructor() {
        super();

        this.r = 0;
        this.bestProbability = -1;
        this.currentPlayer = null;
        this.firstMoveBoard = null;
        this.tempBoard = null;
        this.moves = null;
        this.maxSimulationCount = 1;
        this.probability = 0;
        this.beforeMovingGameBoard = null;
    }

    supplyBestMove(board, player) {
        this.beforeMovingGameBoard = board;
        this.maximizingPlayer = player;

        return this.monteCarloSearch();
    }

    monteCarloSearch() {
        this.bestProbability = -1
        this.moves = getAvailableMovesForPlayer(this.beforeMovingGameBoard, this.maximizingPlayer)
        this.currentPlayer = this.maximizingPlayer
        this.bestMove = null

        this.rootNode = {
            text: 'minimax',
            children: []
        };

        for (const move of this.moves) {
            this.r = 0;

            var startTime = Date.now();
            let numberOfSimulations = 0;

            while (Date.now() < startTime + 10 / this.moves.length) {
                numberOfSimulations++
                this.currentPlayer = this.maximizingPlayer;

                this.gameBoard = cloneGameBoard(this.beforeMovingGameBoard);

                if (!move.shouldPlaceSomething) {
                    moveInGameboard(this.gameBoard, move.x, move.y, move.outX, move.outY);
                } else {
                    placeAtGameBoard(this.gameBoard, move.x, move.y, this.currentPlayer);
                }

                this.currentPlayer = getNextPlayer(this.gameBoard, this.currentPlayer);
                switchToNextPlayer(this.gameBoard);

                let counter = 1;


                while (countPlayerFields(this.gameBoard, getNextPlayer(this.gameBoard, this.currentPlayer)) < 10 + countPlayerFields(this.gameBoard, this.currentPlayer)) {
                    if (countPlayerFields(this.gameBoard, getNextPlayer(this.gameBoard, this.currentPlayer)) === 0 && getPlayerReserve(this.gameBoard, getNextPlayer(this.gameBoard, this.currentPlayer)) > 0) {
                        const movesDuringPlace = getAllPlaceMoves(this.gameBoard, this.currentPlayer);

                        const randomIndex = Math.floor(Math.random() * movesDuringPlace.length);
                        const randomMove = movesDuringPlace[randomIndex];

                        placeAtGameBoard(this.gameBoard, randomMove.x, randomMove.y, this.currentPlayer);
                        this.currentPlayer = getNextPlayer(this.gameBoard, this.currentPlayer);
                        switchToNextPlayer(this.gameBoard);
                        console.log('should place')
                        break;
                    }

                    const randomMoves = getAvailableMovesForPlayer(this.gameBoard, this.currentPlayer).sort((a, b) => b.outX - a.outX + b.outY - a.outY);

                    const randomIndex = Math.floor(Math.random() * randomMoves.length);
                    let randomMove = randomMoves[randomIndex];

                    if (!randomMove.shouldPlaceSomething) {
                        moveInGameboard(this.gameBoard, randomMove.x, randomMove.y, randomMove.outX, randomMove.outY);
                    } else {
                        placeAtGameBoard(this.gameBoard, randomMove.x, randomMove.y, this.currentPlayer);
                    }

                    counter++;

                    this.currentPlayer = getNextPlayer(this.gameBoard, this.currentPlayer);
                    switchToNextPlayer(this.gameBoard);
                }

                checkForVictoryCondition(this.gameBoard);


                if (countPlayerFields(this.gameBoard, this.maximizingPlayer) > countPlayerFields(this.gameBoard, getNextPlayer(this.gameBoard, this.maximizingPlayer))) {
                    this.r++;
                }
                console.log(this.r);
            }

            this.probability = this.r / this.maxSimulationCount;
            if (this.isBetterMoveThanPrevious()) {
                this.updateToNewMove(move);
            }
        }

        return this.bestMove;
    }

    isBetterMoveThanPrevious() {
        return this.probability > this.bestProbability;
    }

    updateToNewMove(move) {
        this.bestMove = move;
        this.bestProbability = this.probability;
    }
}

export class MonteCarloSearch extends AiAlgorithm {
    supplyBestMove(board, player) {
        this.gameBoard = cloneGameBoard(board);
        this.maximizingPlayer = player;

        return this.monteCarloTreeSearch();
    }

    monteCarloTreeSearch() {
        this.availableMoves = getAvailableMovesForPlayer(this.gameBoard, this.maximizingPlayer);
        let current = this.availableMoves[0];
        this.startTime = Date.now();

        const maxLimit = 100;

        while (Date.now() < this.startTime + maxLimit) {
            current = this.treePolicy(current);
            const reward = this.defaultPolicy(current);
            this.backup(current, reward);
        }

    }

    treePolicy(current) {
        while (!checkForVictoryCondition(this.gameBoard)) {
            if (current)
        }

        return current;
    }

    defaultPolicy(current) {

    }

    backup(current, reward) {

    }
}