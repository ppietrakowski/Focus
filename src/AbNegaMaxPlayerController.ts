
import { AiController } from './AiController'
import { evaluateMove } from './EvaluationFunction'
import { IFocus, Move } from './IFocus'
import { IGameBoard } from './IGameBoard'
import { IGameBoardView } from './IGameBoardView'
import { getAvailableMoves } from './LegalMovesFactory'
import { IPlayer } from './Player'

export class AbNegaMaxPlayer extends AiController {
    bestMove: Move
    alpha = -Infinity
    beta = Infinity

    constructor(aiOwnedPlayer: IPlayer, _game: IFocus, _gameBoard: IGameBoardView) {
        super(aiOwnedPlayer, _game, _gameBoard)
    }

    once = true

    depth = 4

    move(): Promise<boolean> {
        this.alpha = -Infinity
        this.beta = Infinity
        this.abNegaMax(this._gameBoard.gameBoard, this.depth, this.ownedPlayer, this.alpha, this.beta)

        return super.move()
    }

    private abNegaMax(board: IGameBoard, depth: number, player: IPlayer, alpha: number, beta: number, sign = 1): number {
        if (this.hasReachedEndConditions(board, depth)) {
            return this.calculateOnEndConditions(board, player)
        }

        const moves = getAvailableMoves(board, this.ownedPlayer)

        if ((moves.length === 0))
            return evaluateMove(board, player, this._game)

        let evaluation = -Infinity

        for (let i = 0; i < moves.length; i++) {
            let current = this.abNegaMax(moves[i].gameBoardAfterMove, depth - 1, player, -beta, -alpha, -sign)
            current *= -1

            if (current > evaluation) {
                if (depth === this.depth) {
                    this.bestMove = moves[i].move
                }

                evaluation = current
            }

            alpha = Math.max(alpha, evaluation)
            if (alpha >= beta) {
                break
            }
        }

        return evaluation
    }
}