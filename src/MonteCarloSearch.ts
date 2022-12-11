import { AiController } from './AiController'
import { Move } from './IFocus'
import { IGameBoard } from './IGameBoard'
import { getAvailableMoves, IAvailableMoves } from './LegalMovesFactory'
import { IPlayer } from './Player'

export class MonteCarloSearch extends AiController {
    private simulationsCount = 0
    private maxCooldown = 200
    private r = 0
    private bestProbability = -1
    private currentPlayer: IPlayer
    private startTime: number
    private maxWaitingTime: number
    private firstMoveBoard: IGameBoard
    private tempBoard: IGameBoard
    private moves: Move[]

    supplyBestMove(): Move {
        return this.monteCarloSearch()
    }

    private monteCarloSearch(): Move {
        this.bestProbability = -1
        this.moves = getAvailableMoves(this.gameBoard, this.ownedPlayer).map(m => m.move)
        this.currentPlayer = this.ownedPlayer
        this.bestMove = null

        for (const move of this.moves) {
            this.simulateMove(move)
        }

        console.log(this.bestProbability)

        return this.bestMove
    }

    private simulateMove(move: Move) {
        this.r = 0
        this.simulationsCount = 0
        this.startTime = Date.now()
        this.maxWaitingTime = this.startTime + this.maxCooldown

        while (Date.now() < this.maxWaitingTime) {
            this.simulateNextMove(move)
        }

        if (this.isBetterMoveThanPrevious()) {
            this.updateToNewMove(move)
        }
    }

    private isBetterMoveThanPrevious() {
        return this.r / this.simulationsCount > this.bestProbability
    }

    private updateToNewMove(move: Move) {
        this.bestMove = move
        this.bestProbability = this.r / this.simulationsCount
    }

    private simulateNextMove(move: Move) {
        this.simulationsCount++
        this.firstMoveBoard = this.gameBoard.getBoardAfterSpecifiedMove(move, this.currentPlayer)
        this.currentPlayer = this.game.getNextPlayer(this.currentPlayer)

        this.tempBoard = this.firstMoveBoard

        while (!this.hasMeetFinalCondition(this.tempBoard, this.currentPlayer)) {
            this.simulateUntilWin()
        }

        if (this.tempBoard.countPlayersFields(this.game.getNextPlayer(this.ownedPlayer)) == 0) {
            this.r++
        }
    }

    simulateUntilWin() {
        const availableMoves = getAvailableMoves(this.tempBoard, this.currentPlayer).map(m => m.move)
        if (this.tempBoard.countPlayersFields(this.currentPlayer) === 0 && this.hasPlayerPool(this.tempBoard, this.currentPlayer)) {
            const allPlacingMoves = availableMoves.filter(m => !!m.shouldPlaceSomething)
            const randomIndex = Math.floor(Math.random() * allPlacingMoves.length)
            const randomMove = allPlacingMoves[randomIndex]
            this.tempBoard = this.tempBoard.getBoardAfterSpecifiedMove(randomMove, this.currentPlayer)
            this.currentPlayer = this.game.getNextPlayer(this.currentPlayer)
            return
        }
        
        const randomIndex = Math.floor(Math.random() * availableMoves.length)
        const randomMove = availableMoves[randomIndex]
        this.tempBoard = this.tempBoard.getBoardAfterSpecifiedMove(randomMove, this.currentPlayer)
        this.currentPlayer = this.game.getNextPlayer(this.currentPlayer)
    }

    hasMeetFinalCondition(board: IGameBoard, player: IPlayer) {
        return board.countPlayersFields(player) <= 0 && !this.hasPlayerPool(board, player)
    }

    hasPlayerPool(board: IGameBoard, player: IPlayer): boolean {
        return (player.isRed && board.redPlayerPawnCount > 0)
            || (player.isGreen && board.greenPlayerPawnCount > 0)
    }
}