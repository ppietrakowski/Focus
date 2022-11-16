import { AiController } from './AiController'
import { evaluateMove } from './EvaluationFunction'
import { PLAYER_GREEN, PLAYER_RED } from './Game'
import { GameBoard } from './GameBoard'
import { randomBoolean } from './GameUtils'
import { FieldState, IField } from './IField'
import { IFocus, Move } from './IFocus'
import { AfterPlaceMove, IGameBoard } from './IGameBoard'
import { IGameBoardView } from './IGameBoardView'
import { getAvailableMoves, getLegalMovesFromField } from './LegalMovesFactory'
import { IPlayer } from './Player'


export interface AiMove
{
    move?: Move
    gameBoardAfterMove: IGameBoard
    shouldPlaceSomething?: boolean
    x?: number
    y?: number

    redCount: number
    greenCount: number
}

export interface BestMove
{
    bestMove?: Move
    value: number
    shouldPlaceSomething?: boolean
    x?: number
    y?: number

    redCount: number
    greenCount: number
}

type JustMinMaxValue = {
    value: number
}

export class MinMaxAiPlayerController extends AiController
{
    constructor(aiOwnedPlayer: IPlayer, _game: IFocus, _gameBoard: IGameBoardView)
    {
        super(aiOwnedPlayer, _game, _gameBoard)
    }

    move(): void
    {
        const bestMove = this.minMax(this._gameBoard.gameBoard, 3, true, this.ownedPlayer) as BestMove
        console.log(bestMove.value)
        if (!bestMove.shouldPlaceSomething && !bestMove.bestMove)
        {
            console.error('somethin\' gone wrong minmax')
            return
        }

        if (bestMove.shouldPlaceSomething)
        {
            console.log(`${bestMove.x}, ${bestMove.y}`)
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

        availablePlaceMoves.sort((a, b) => evaluateMove(a.afterPlaceMove.gameBoard, null, this.ownedPlayer, this._game) - evaluateMove(b.afterPlaceMove.gameBoard, null, this.ownedPlayer, this._game))

        const best = availablePlaceMoves[0]


        this._game.placeField(best.x, best.y, this.ownedPlayer)
    }

    private minMax(board: IGameBoard, depth: number, isMaximizingPlayer: boolean, player: IPlayer, afterPlaceMove?: AiMove): number | BestMove
    {
        if (depth === 0 || board.countPlayersFields(this._game.getNextPlayer(player)) === 0)
            return evaluateMove(board, afterPlaceMove, player, this._game)

        let evaluation = -Infinity

        if (!isMaximizingPlayer)
        {
            evaluation = Infinity
        }

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

        const assignNewValue = (current: number, i: number) =>
        {
            evaluation = current
            bestMove = moves[i].move
            x = moves[i].x
            y = moves[i].y
            shouldPlaceSomething = moves[i].shouldPlaceSomething
            redCount = moves[i].redCount
            greenCount = moves[i].greenCount
        }

        for (let i = 0; i < moves.length; i++)
        {
            const current = this.minMax(moves[i].gameBoardAfterMove, depth - 1, !isMaximizingPlayer, this._game.getNextPlayer(player), movesAndCount.aiMoves[i]) as number

            if (isMaximizingPlayer)
            {
                let val = current as any

                if ((typeof val != 'number') && val.value)
                    val = val.value

                if (val > evaluation)
                {
                    assignNewValue(val, i)
                }
            } else
            {
                let val = current as any

                if ((typeof val != 'number') && val.value)
                    val = val.value

                if (val < evaluation)
                {
                    assignNewValue(val, i)
                }
            }
        }

        return { bestMove, value: evaluation, x, y, shouldPlaceSomething, redCount, greenCount }
    }
}