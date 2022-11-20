
import { AiController, getPlayerName } from './AiController'
import { evaluateMove } from './EvaluationFunction'
import { PLAYER_GREEN, PLAYER_RED } from './Game'
import { GameBoard } from './GameBoard'
import { randomBoolean } from './GameUtils'
import { FieldState, IField } from './IField'
import { IFocus, Move } from './IFocus'
import { AfterPlaceMove, IGameBoard } from './IGameBoard'
import { IGameBoardView } from './IGameBoardView'
import { getAvailableMoves, getLegalMovesFromField } from './LegalMovesFactory'
import { AiMove, BestMove, comparatorPlaceMoveType } from './MinMaxAiPlayerController'
import { IPlayer } from './Player'


let ownedPlayer: IPlayer = null
let _game: IFocus = null

function availablePlaceMovesComparator(a: comparatorPlaceMoveType, b: comparatorPlaceMoveType)
{
    return evaluateMove(a.afterPlaceMove.gameBoard, null, ownedPlayer, _game) - evaluateMove(b.afterPlaceMove.gameBoard, null, ownedPlayer, _game)
}

export class NegaMaxPlayer extends AiController
{
    constructor(aiOwnedPlayer: IPlayer, _game: IFocus, _gameBoard: IGameBoardView)
    {
        super(aiOwnedPlayer, _game, _gameBoard)
    }

    move(): void
    {
        const bestMove = this.negamax(this._gameBoard.gameBoard, 2, true, this.ownedPlayer) as BestMove
        if (!bestMove.shouldPlaceSomething && !bestMove.bestMove)
        {
            const v = getAvailableMoves(this._gameBoard.gameBoard, this.ownedPlayer)
            return
        }

        if (bestMove.shouldPlaceSomething)
        {
            console.log(`placed at ${bestMove.x}, ${bestMove.y}`)
            this._game.placeField(bestMove.x, bestMove.y, this.ownedPlayer)
        }
        else
        {
            if (!this._game.moveToField(bestMove.bestMove.x, bestMove.bestMove.y, bestMove.bestMove.direction, bestMove.bestMove.moveCount))
                console.warn('should not happen')
        }
    }


    onPlaceStateStarted(): void
    {
        const enemyFields: IField[] = []

        this._game.gameBoard.each(v =>
        {
            if (!this.ownedPlayer.doesOwnThisField(v))
                enemyFields.push(v)
        })

        const availablePlaceMoves: { afterPlaceMove: AfterPlaceMove, x: number, y: number }[] = []

        enemyFields.forEach(v =>
        {
            const afterPlaceMove = this._game.gameBoard.getBoardAfterPlace(v.x, v.y, this.ownedPlayer)
            availablePlaceMoves.push({ afterPlaceMove, x: v.x, y: v.y })
        })

        ownedPlayer = this.ownedPlayer
        _game = this._game

        availablePlaceMoves.sort(availablePlaceMovesComparator)

        const best = availablePlaceMoves[0]


        this._game.placeField(best.x, best.y, this.ownedPlayer)
    }

    private negamax(board: IGameBoard, depth: number, isMaximizingPlayer: boolean, player: IPlayer, sign = 1, afterPlaceMove?: AiMove): number | BestMove
    {
        if (depth === 0 || board.countPlayersFields(this._game.getNextPlayer(player)) === 0)
            return sign * evaluateMove(board, afterPlaceMove, player, this._game)

        const movesAndCount = getAvailableMoves(board, player)
        const moves = movesAndCount.aiMoves
        if (moves.length < 1)
            return 0

        let bestMove = moves[0].move
        let x = 0
        let y = 0
        let redCount = 0
        let greenCount = 0
        let shouldPlaceSomething = false

        let evaluation = -Infinity

        _game = this._game
        ownedPlayer = _game.getNextPlayer(player)

        for (let i = 0; i < moves.length; i++)
        {
            const current = -this.negamax(moves[i].gameBoardAfterMove, depth - 1, !isMaximizingPlayer, ownedPlayer, -sign, movesAndCount.aiMoves[i]) as number

            if (evaluation < current)
            {
                evaluation = current
                bestMove = moves[i].move
                x = moves[i].x
                y = moves[i].y
                shouldPlaceSomething = moves[i].shouldPlaceSomething
                redCount = moves[i].redCount
                greenCount = moves[i].greenCount
            }
        }

        return { bestMove, value: evaluation, x, y, shouldPlaceSomething, redCount, greenCount }
    }
}