import { AiController } from './AiController'
import { Move } from './IFocus'
import { getAvailableMoves, IAvailableMoves } from './LegalMovesFactory'

export class MonteCarloSearch extends AiController {


    simulationsCount = 3

    supplyBestMove(): Move {
        return this.monteCarloSearch()
    }

    private monteCarloSearch(): Move {
        let bestMove: Move = null
        let bestProbability = -1
        const moves = getAvailableMoves(this.gameBoard, this.ownedPlayer).map(m => m.move)
        let player = this.ownedPlayer

        for (const move of moves) {
            let r = 0
            let numberOfSimulations = 0
            const startTime = Date.now()

            while (new Date().getTime() < startTime) {
                numberOfSimulations++
                const board = this.gameBoard.getBoardAfterSpecifiedMove(move, player)
                player = this.game.getNextPlayer(player)
                
                let tempBoard = board

                while (tempBoard.countPlayersFields(player) > 0) {
                    const availableMoves = getAvailableMoves(board, player).map(m => m.move)

                    const randomIndex = Math.floor(Math.random() * availableMoves.length)
                    const randomMove = availableMoves[randomIndex]
                    tempBoard = tempBoard.getBoardAfterSpecifiedMove(randomMove, player)
                    player = this.game.getNextPlayer(player)
                }

                if (board.countPlayersFields(this.game.getNextPlayer(this.ownedPlayer)) == 0) {
                    r++
                }
            }
            if (r / numberOfSimulations > bestProbability) {
                bestMove = move
                bestProbability = r / numberOfSimulations
            }
        }

        return bestMove
    }
}