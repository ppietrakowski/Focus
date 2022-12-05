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
    bestMove: Move

    constructor(aiOwnedPlayer: IPlayer, _game: IFocus, _gameBoard: IGameBoardView) {
        super(aiOwnedPlayer, _game, _gameBoard)
    }

    depth = 4

    move(): Promise<boolean> {
        this.minMax(this._gameBoard.gameBoard, this.depth, this.ownedPlayer)

        return super.move()
    }

    private minMax(board: IGameBoard, depth: number, player: IPlayer): number {
        if (this.hasReachedEndConditions(board, depth)) {
            return this.calculateOnEndConditions(board, player)
        }

        const moves = getAvailableMoves(board, this.ownedPlayer)

        player = this._game.getNextPlayer(player)

        if ((moves.length === 0))
            return evaluateMove(board, player, this._game)

        player = this._game.getNextPlayer(player)

        if (player === this.ownedPlayer) {
            let evaluation = -Infinity

            for (let i = 0; i < moves.length; i++) {
                player = this._game.getNextPlayer(player)

                const current = this.minMax(moves[i].gameBoardAfterMove, depth - 1, player)

                player = this._game.getNextPlayer(player)
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
                player = this._game.getNextPlayer(player)

                const current = this.minMax(moves[i].gameBoardAfterMove, depth - 1, player)

                player = this._game.getNextPlayer(player)
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
