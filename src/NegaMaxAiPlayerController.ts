
import { AiController } from './AiController'
import { evaluateMove } from './EvaluationFunction'
import { PLAYER_RED } from './Game'
import { IField } from './IField'
import { IFocus } from './IFocus'
import { AfterPlaceMove, IGameBoard } from './IGameBoard'
import { IGameBoardView } from './IGameBoardView'
import { getAvailableMoves } from './LegalMovesFactory'
import { AiMove, BestMove, comparatorPlaceMoveType } from './MinMaxAiPlayerController'
import { IPlayer } from './Player'

let ownedPlayer: IPlayer = null
let _game: IFocus = null

function availablePlaceMovesComparator(a: comparatorPlaceMoveType, b: comparatorPlaceMoveType) {
    return evaluateMove(a.afterPlaceMove.gameBoard, null, ownedPlayer, _game) - evaluateMove(b.afterPlaceMove.gameBoard, null, ownedPlayer, _game)
}

export class NegaMaxPlayer extends AiController {
    constructor(aiOwnedPlayer: IPlayer, _game: IFocus, _gameBoard: IGameBoardView) {
        super(aiOwnedPlayer, _game, _gameBoard)
    }

    once = true

    move(): Promise<boolean> {
        const { bestMove } = this.negamax(this._gameBoard.gameBoard, 1, this.ownedPlayer === PLAYER_RED, this.ownedPlayer) as BestMove

        if (!bestMove && !bestMove.move.shouldPlaceSomething) {
            const v = getAvailableMoves(this._gameBoard.gameBoard, this.ownedPlayer)
            console.log(v)
            console.log(bestMove)
            console.log(this._game.gameBoard)
            return Promise.reject(!bestMove)
        }

        if (bestMove.move.shouldPlaceSomething)
            console.log(true)

        if (bestMove.move.shouldPlaceSomething) {
            const { move } = bestMove

            console.log(`placed at ${move.x}, ${move.y}`)
            this._game.placeField(move.x, move.y, this.ownedPlayer)
            return Promise.resolve(true)
        }

        const { move } = bestMove

        const pr = this._game.moveToField(move.x, move.y, move.direction, move.moveCount)

        return pr
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

        ownedPlayer = this.ownedPlayer
        _game = this._game

        availablePlaceMoves.sort(availablePlaceMovesComparator)

        const best = availablePlaceMoves[0]


        this._game.placeField(best.x, best.y, this.ownedPlayer)
    }

    private negamax(board: IGameBoard, depth: number, isMaximizingPlayer: boolean, player: IPlayer, sign = 1, afterPlaceMove?: AiMove): BestMove {
        if (depth === 0)
            return { value: sign * evaluateMove(board, afterPlaceMove, player, this._game), bestMove: afterPlaceMove }

        const movesAndCount = getAvailableMoves(board, player)

        if ((movesAndCount.afterPlaceMoves.length === 0 && movesAndCount.aiMoves.length === 0))
            return { value: sign * evaluateMove(board, afterPlaceMove, player, this._game), bestMove: afterPlaceMove }

        const moves = movesAndCount.aiMoves
        if (moves.length < 1)
            return null

        let bestMove = moves[0]

        let evaluation = -Infinity

        for (let i = 0; i < moves.length; i++) {
            const current = this.negamax(moves[i].gameBoardAfterMove, depth - 1, !isMaximizingPlayer, player, -sign, movesAndCount.aiMoves[i])
            current.value *= -1

            if (current.value > evaluation) {
                evaluation = current.value
                bestMove = current.bestMove
            }
        }


        return { bestMove: bestMove, value: evaluation }
    }
}