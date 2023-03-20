import { cloneField, FIELD_STATE_EMPTY, FIELD_STATE_UNPLAYABLE } from "./field.js";
import { GameBoard } from "./gameboard.js";
import { setAvailableForMove } from "./gameloop.js";

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
     * @param {GameBoard} gameBoard 
     */
    constructor(algorithm, ownedPlayer, gameBoard) {
        this.algorithm = algorithm;
        this.ownedPlayer = ownedPlayer;
        this.gameBoard = gameBoard;
    }

    move() {
        const move = this.algorithm.supplyBestMove(this.gameBoard, this.ownedPlayer);

        if (move.shouldPlaceSomething) {
            this.gameBoard.placeAtGameBoard(move.x, move.y, this.ownedPlayer);
        } else {
            this.gameBoard.moveInGameboard(move.x, move.y, move.outX, move.outY, this.ownedPlayer);
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
            const aGameBoard = this.gameBoard.clone();
            const bGameBoard = this.gameBoard.clone();
            aGameBoard.placeAtGameBoard(a.x, a.y, this.ownedPlayer);
            bGameBoard.placeAtGameBoard(b.x, b.y, this.ownedPlayer);

            return evaluateMove(bGameBoard, this.ownedPlayer) - evaluateMove(aGameBoard, this.ownedPlayer);
        });

        const move = p[0];

        this.gameBoard.placeAtGameBoard(move.x, move.y, this.ownedPlayer);
        setAvailableForMove();
    }
}

/**
 * 
 * @param {GameBoard} board 
 * @param {number} player
 * @returns {AiMove[]} 
 */
function getAvailableMovesForPlayer(board, player) {
    const yourFields = board.filterGameboardFields(f => f.fieldState === player);

    const fieldsWithMoves = yourFields.flatMap(f => {
        return { x: f.posX, y: f.posY, moves: board.getMovesFromField(f.posX, f.posY) };
    });

    let moves = [];

    for (let field of yourFields) {
        const move = fieldsWithMoves.find(move => move.x === field.posX && move.y === field.posY);

        for (let i = 0; i < move.moves.length; i++) {
            moves.push(new AiMove(board, move.x, move.y, move.x + move.moves[i].x, move.y + move.moves[i].y, false));
        }
    }

    if (board.reserve[player] > 0) {
        const enemyFields = board.filterGameboardFields(f => f.fieldState !== player);

        for (let i = 0; i < enemyFields.length; i++) {
            moves.push(new AiMove(board, enemyFields[i].posX, enemyFields[i].posY, 0, 0, true));
        }
    }

    return moves;
}

function getAllPlaceMoves(board, player) {
    let moves = [];

    if (board.getPlayerReserve(player) > 0) {
        const enemyFields = board.filterGameboardFields(f => f.fieldState !== player && f.fieldState !== FIELD_STATE_UNPLAYABLE);

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

/**
 * 
 * @param {GameBoard} board 
 * @param {*} player 
 * @returns 
 */
function evaluateMove(board, player) {
    let controlledByYou = 0

    let controlledByEnemy = 0

    let controlledInReserveByYou = 0
    let controlledInReserveByEnemy = 0

    controlledInReserveByYou = board.getPlayerReserve(player);
    controlledInReserveByEnemy = board.getPlayerReserve(board.getNextPlayer(player));

    let ratioInReserve = controlledInReserveByYou - controlledInReserveByEnemy
    if (Number.isNaN(ratioInReserve))
        ratioInReserve = 0.0

    const yourFields = board.filterGameboardFields(f => f.fieldState === player && f.fieldState !== FIELD_STATE_EMPTY && f.fieldState !== FIELD_STATE_UNPLAYABLE);
    const enemyFields = board.filterGameboardFields(f => f.fieldState !== player && f.fieldState !== FIELD_STATE_EMPTY && f.fieldState !== FIELD_STATE_UNPLAYABLE)

    controlledByYou = yourFields.length
    controlledByEnemy = enemyFields.length
    const ratio = (controlledByYou - controlledByEnemy) ^ (1.4)

    const heightOfYourFields = yourFields.reduce((accumulated, current) => accumulated + current.getFieldHeight() - 1, 0)
    const heightOfEnemyFields = enemyFields.reduce((accumulated, current) => accumulated + + current.getFieldHeight() - 1, 0)

    const evalValue = 10 * ratio + 1 * ratioInReserve + 2 * (heightOfYourFields - heightOfEnemyFields)

    return evalValue
}

function hasMeetFinalCondition(gameboard, depth) {
    return gameboard.checkForVictoryCondition() || depth === 0;
}

function onFinalConditionOccured(gameboard, player, maximizingPlayer) {
    if (gameboard.winner !== maximizingPlayer) {
        // owned player wins
        const result = -evaluateMove(gameboard, player);
        return result;
    }

    const result = evaluateMove(gameboard, player);
    return result;
}

export class MinMaxPlayer extends AiAlgorithm {

    constructor(mustUseAlphaBetaPrunning, depth) {
        super();

        this.bestMove = null;
        this.gameBoard = null;
        this.depth = depth;
        this.mustUseAlphaBetaPrunning = mustUseAlphaBetaPrunning;
    }

    supplyBestMove(board, player) {
        this.gameBoard = board.clone();
        this.maximizingPlayer = player;

        this.rootNode = {
            text: 'minimax',
            children: []
        };

        const bestScore = this.minMax(this.depth, player, this.rootNode);
        this.rootNode.text = bestScore;
        chartConfig.nodeStructure = this.rootNode;

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

        if (this.maximizingPlayer === this.gameBoard.currentPlayer) {
            let bestScore = -Infinity;

            for (let move of moves) {
                let childDrawnNode = {
                    text: { name: "MAX " + this.maximizingPlayer + " " + JSON.stringify(move) },
                    children: []
                };

                const backupField = cloneField(this.gameBoard.fields[move.y][move.x]);
                let backupField2 = null;

                if (move.shouldPlaceSomething) {
                    this.gameBoard.placeAtGameBoard(move.x, move.y, player);
                } else {
                    backupField2 = cloneField(this.gameBoard.fields[move.outY][move.outX]);

                    this.gameBoard.moveInGameboard(move.x, move.y, move.outX, move.outY, player);
                }

                player = this.gameBoard.getNextPlayer(player);
                this.gameBoard.switchToNextPlayer();

                let score = this.minMax(depth - 1, player, childDrawnNode, alpha, beta);
                this.gameBoard.fields[move.y][move.x] = backupField;

                childDrawnNode.text = score.toString();


                player = this.gameBoard.getNextPlayer(player);
                this.gameBoard.switchToNextPlayer();

                if (!!backupField2) {
                    this.gameBoard.fields[move.outY][move.outX] = backupField2;
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

                const backupField = cloneField(this.gameBoard.fields[move.y][move.x]);
                let backupField2 = null;

                if (move.shouldPlaceSomething) {
                    this.gameBoard.placeAtGameBoard(move.x, move.y, player);
                } else {
                    backupField2 = cloneField(this.gameBoard.fields[move.outY][move.outX]);

                    this.gameBoard.moveInGameboard(move.x, move.y, move.outX, move.outY, player);
                }

                player = this.gameBoard.getNextPlayer(player);
                this.gameBoard.switchToNextPlayer();

                let score = this.minMax(depth - 1, player, childDrawnNode, alpha, beta);
                this.gameBoard.fields[move.y][move.x] = backupField;

                player = this.gameBoard.getNextPlayer(player);
                this.gameBoard.switchToNextPlayer();

                if (!!backupField2) {
                    this.gameBoard.fields[move.outY][move.outX] = backupField2;
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

    constructor(mustUseAlphaBetaPrunning, depth) {
        super();

        this.bestMove = null;
        this.gameBoard = null;
        this.depth = depth;
        this.mustUseAlphaBetaPrunning = mustUseAlphaBetaPrunning;
    }

    supplyBestMove(board, player) {
        this.gameBoard = board.clone();

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

            const backupField = cloneField(this.gameBoard.fields[move.y][move.x]);
            let backupField2 = null;

            if (move.shouldPlaceSomething) {
                this.gameBoard.placeAtGameBoard(move.x, move.y, player);
            } else {
                backupField2 = cloneField(this.gameBoard.fields[move.outY][move.outX]);

                this.gameBoard.moveInGameboard(move.x, move.y, move.outX, move.outY, player);
            }

            player = this.gameBoard.getNextPlayer(player);
            this.gameBoard.switchToNextPlayer();

            let score = -this.negamax(depth - 1, player, childDrawnNode, -beta, -alpha, -sign);

            player = this.gameBoard.getNextPlayer(player);
            this.gameBoard.switchToNextPlayer();

            this.gameBoard.fields[move.y][move.x] = backupField;

            if (!!backupField2) {
                this.gameBoard.fields[move.outY][move.outX] = backupField2;
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
        this.maxSimulationCount = 3;
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

            let numberOfSimulations = 0;

            while (numberOfSimulations < this.maxSimulationCount) {
                numberOfSimulations++
                this.currentPlayer = this.maximizingPlayer;

                this.gameBoard = this.beforeMovingGameBoard.clone();

                if (!move.shouldPlaceSomething) {
                    this.gameBoard.moveInGameboard(move.x, move.y, move.outX, move.outY);
                } else {
                    this.gameBoard.placeAtGameBoard(move.x, move.y, this.currentPlayer);
                }

                this.currentPlayer = this.gameBoard.getNextPlayer(this.currentPlayer);
                this.gameBoard.switchToNextPlayer();

                let counter = 0;
                let testMove = null;

                while (this.gameBoard.checkForVictoryCondition()) {
                    if (this.gameBoard.countPlayerFields(this.gameBoard.getNextPlayer(this.currentPlayer)) === 0 && this.gameBoard.getPlayerReserve(this.gameBoard.getNextPlayer(this.currentPlayer)) > 0) {
                        const movesDuringPlace = getAllPlaceMoves(this.gameBoard, this.currentPlayer);

                        const randomIndex = Math.floor(Math.random() * movesDuringPlace.length);
                        const randomMove = movesDuringPlace[randomIndex];

                        this.gameBoard.placeAtGameBoard(randomMove.x, randomMove.y, this.currentPlayer);
                        this.currentPlayer = this.gameBoard.getNextPlayer(this.currentPlayer);
                        this.gameBoard.switchToNextPlayer();
                        console.log('should place')
                        break;
                    }

                    const randomMoves = getAvailableMovesForPlayer(this.gameBoard, this.currentPlayer).sort((a, b) => b.outX - a.outX + b.outY - a.outY);

                    const randomIndex = Math.floor(Math.random() * randomMoves.length);
                    let randomMove = randomMoves[randomIndex];

                    if (!randomMove.shouldPlaceSomething) {
                        this.gameBoard.moveInGameboard(randomMove.x, randomMove.y, randomMove.outX, randomMove.outY);
                    } else {
                        this.gameBoard.placeAtGameBoard(randomMove.x, randomMove.y, this.currentPlayer);
                    }

                    counter++;

                    if (counter >= 10000) {

                        const randomIndex = getAvailableMovesForPlayer(this.gameBoard, this.currentPlayer).sort((a, b) => b.outX - a.outX + b.outY - a.outY);
                        testMove = randomMoves[randomIndex];
                        break;
                    }

                    this.currentPlayer = this.gameBoard.getNextPlayer(this.currentPlayer);
                    this.gameBoard.switchToNextPlayer();
                }

                this.gameBoard.checkForVictoryCondition();

                if (testMove) {
                    const score = evaluateMove(this.gameBoard, this.maximizingPlayer);
                    if (testMove.shouldPlaceSomething) {
                        this.gameBoard.placeAtGameBoard(testMove.x, testMove.y, player);
                    } else {
                        backupField2 = cloneField(this.gameBoard.fields[testMove.outY][testMove.outX]);

                        this.gameBoard.moveInGameboard(testMove.x, testMove.y, testMove.outX, testMove.outY, player);
                    }

                    const score2 = evaluateMove(this.gameBoard, this.maximizingPlayer);

                    if (score2 > score) {
                        this.r++;
                        continue;
                    }
                }

                if (this.gameBoard.countPlayerFields(this.maximizingPlayer) > this.gameBoard.countPlayerFields(this.gameBoard.getNextPlayer(this.maximizingPlayer))) {
                    this.r++;
                }
            }

            this.probability = this.r / this.maxSimulationCount;
            console.log(this.probability)
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

export class MonteCarloTreeSearch extends AiAlgorithm {
    supplyBestMove(board, player) {
        this.gameBoard = board.clone();
        this.maximizingPlayer = player;

        return this.monteCarloTreeSearch();
    }

    // NODE=gameboard

    monteCarloTreeSearch() {
        let current = this.gameBoard;
        current.isBetterMoveThanPrevious.moves = getAvailableMovesForPlayer(this.gameBoard, this.maximizingPlayer);
        this.startTime = Date.now();

        const maxLimit = 1000;

        while (Date.now() < this.startTime + maxLimit) {
            current = this.treePolicy(current);
            const reward = this.defaultPolicy(current);
            this.backup(current, reward);
        }

    }

    treePolicy(current) {
        let counter = 0;

        while (!current.checkForVictoryCondition()) {
            if (current.stats.moves.length > 0) {
                current = this.expandBoard(current);
            } else {
                current = this.getBestChild(current);
            }

            counter++;

            if (counter > 1000) {
                return current;
            }
        }

        return current;
    }

    expandBoard(current) {
        const move = current.stats.moves.pop();

        const board = current.clone();

        if (move.shouldPlaceSomething) {
            board.placeAtGameBoard(move.x, move.y, board.current);
        } else {
            board.moveInGameboard(move.x, move.y, move.outX, move.outY, board.currentPlayer);
        }

        board.switchToNextPlayer();
        board.stats.moves = getAvailableMovesForPlayer(board, board.currentPlayer);
        current.stats.children.push(board);
        board.stats.parent = current;

        return board;
    }

    defaultPolicy(current) {
        let counter = 0;

        while (!current.checkForVictoryCondition()) {
            const move = current.stats.moves.pop();

            if (move.shouldPlaceSomething) {
                current.placeAtGameBoard(move.x, move.y, current.currentPlayer);
            } else {
                current.moveInGameboard(move.x, move.y, move.outX, move.outY, current.currentPlayer);
            }

            counter++;

            if (counter > 1000) {
                break;
            }

            current.switchToNextPlayer();
        }

        return current.doesAnyoneWin() && current.winner == this.maximizingPlayer;
    }

    backup(current, reward) {
        while (!!current) {
            current.stats.visits += 1;
            current.stats.winrate += reward;
            current = current.stats.parent;
        }
    }

    getBestChild(current) {
        let value = -Infinity;
        let bestChild = null;

        for (let child of child.stats.children) {
            const stats = child.stats;
            let childValue = stats.winrate / stats.visits + 2 * Math.sqrt(Math.log(!!stats.parent ? stats.parent.stats.visits : 1) / stats.visits);
            if (childValue > value) {
                bestChild = child.clone();
                value = childValue;
            }
        }
        return bestChild;
    }
}