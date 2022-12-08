import { AiController } from './AiController'
import { evaluateMove } from './EvaluationFunction'
import { IFocus, Move } from './IFocus'
import { IGameBoard } from './IGameBoard'
import { IGameBoardView } from './IGameBoardView'
import { getAvailableMoves } from './LegalMovesFactory'
import { IPlayer } from './Player'

export interface AiMove {
    move?: Move
    gameBoardAfterMove: IGameBoard
}

export interface BestMove {
    bestMove: AiMove
    value: number
}

export type JustMinMaxValue = {
    value: number
}

export class MinMaxAiPlayerController extends AiController {
    
    constructor(aiOwnedPlayer: IPlayer, game: IFocus, gameBoard: IGameBoardView) {
        super(aiOwnedPlayer, game, gameBoard)
    }

    depth = 3

    supplyBestMove(): Move {
        this.minMax(this.gameBoard, this.depth, this.ownedPlayer)
        return this.bestMove
    }

    private minMax(board: IGameBoard, depth: number, player: IPlayer): number {
        if (this.hasReachedEndConditions(board, depth)) {
            return this.calculateOnEndConditions(board, player)
        }

        const moves = getAvailableMoves(board, player)

        if ((moves.length === 0))
            return evaluateMove(board, player, this.game)

        if (player === this.game.currentPlayingColor) {
            let evaluation = -Infinity

            for (let i = 0; i < moves.length; i++) {
                player = this.game.getNextPlayer(player)
                const current = this.minMax(moves[i].gameBoardAfterMove, depth - 1, player)

                if (current > evaluation) {
                    if (depth === this.depth) {
                        this.bestMove = moves[i].move
                    }
                    evaluation = current
                }
            }


            return evaluation
        } else {

            let evaluation = Infinity


            for (let i = 0; i < moves.length; i++) {
                player = this.game.getNextPlayer(player)

                const current = this.minMax(moves[i].gameBoardAfterMove, depth - 1, player)

                if (current < evaluation) {
                    if (depth === this.depth) {
                        this.bestMove = moves[i].move
                    }
                    evaluation = current
                }
            }

            return evaluation
        }
    }
}
