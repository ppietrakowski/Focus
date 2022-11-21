import { AiController } from './AiController'
import { evaluateMove } from './EvaluationFunction'
import { PLAYER_RED } from './Game'
import { IField } from './IField'
import { IFocus, Move } from './IFocus'
import { AfterPlaceMove, IGameBoard } from './IGameBoard'
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

export type comparatorPlaceMoveType = {
    afterPlaceMove: AfterPlaceMove
    x: number
    y: number
}

export class MinMaxAiPlayerController extends AiController {
    constructor(aiOwnedPlayer: IPlayer, _game: IFocus, _gameBoard: IGameBoardView) {
        super(aiOwnedPlayer, _game, _gameBoard)
    }

    move(): Promise<boolean> {
        const { bestMove } = this.minMax(this._gameBoard.gameBoard, 1, this.ownedPlayer === PLAYER_RED, this.ownedPlayer) as BestMove

        if (!bestMove.move.shouldPlaceSomething && !bestMove) {
            const v = getAvailableMoves(this._gameBoard.gameBoard, this.ownedPlayer)
            console.log(v)
            console.log(bestMove)
            console.log(this._game.gameBoard)
            return
        }

        if (bestMove.move.shouldPlaceSomething) {
            const { move } = bestMove

            console.log(`placed at ${move.x}, ${move.y}`)
            this._game.placeField(move.x, move.y, this.ownedPlayer)
            return Promise.resolve(true)
        }
        else {
            const { move } = bestMove

            return this._game.moveToField(move.x, move.y, move.direction, move.moveCount)
        }
    }


    onPlaceStateStarted(): void {
        const enemyFields: IField[] = []

        this._game.gameBoard.each(v => {
            if (!this.ownedPlayer.doesOwnThisField(v))
                enemyFields.push(v)
        })

        const availablePlaceMoves: { afterPlaceMove: AfterPlaceMove, x: number, y: number }[] = []

        enemyFields.forEach(v => {
            const afterPlaceMove = this._game.gameBoard.getBoardAfterPlace(v.x, v.y, this.ownedPlayer)
            availablePlaceMoves.push({ afterPlaceMove, x: v.x, y: v.y })
        })

        const best = availablePlaceMoves[0]


        this._game.placeField(best.x, best.y, this.ownedPlayer)
    }

    private minMax(board: IGameBoard, depth: number, isMaximizingPlayer: boolean, player: IPlayer, afterPlaceMove?: AiMove): BestMove {
        if (depth === 0) {
            return { value: evaluateMove(board, afterPlaceMove, player, this._game), bestMove: afterPlaceMove }
        }

        const movesAndCount = getAvailableMoves(board, player)

        if ((movesAndCount.afterPlaceMoves.length === 0 && movesAndCount.aiMoves.length === 0))
            return { value: evaluateMove(board, afterPlaceMove, player, this._game), bestMove: afterPlaceMove }

        let evaluation = -Infinity

        if (!isMaximizingPlayer) {
            evaluation = Infinity
        }

        const moves = movesAndCount.aiMoves
        if (moves.length < 1)
            return null

        let bestMove = moves[0]

        const assignNewValue = function (current: BestMove) {
            evaluation = current.value
            bestMove = current.bestMove
        }

        for (let i = 0; i < moves.length; i++) {
            const current = this.minMax(moves[i].gameBoardAfterMove, depth - 1, !isMaximizingPlayer, player, movesAndCount.aiMoves[i])

            if (isMaximizingPlayer) {
                if (current.value > evaluation)
                    assignNewValue(current)
            } else {
                if (current.value < evaluation)
                    assignNewValue(current)
            }
        }

        return { bestMove: bestMove, value: evaluation }
    }
}