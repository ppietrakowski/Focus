import { AiController } from './AiController'
import { evaluateMove } from './EvaluationFunction'
import { PLAYER_GREEN, PLAYER_RED } from './Game'
import { GameBoard } from './GameBoard'
import { randomBoolean } from './GameUtils'
import { FieldState, IField } from './IField'
import { IFocus, Move } from './IFocus'
import { AfterPlaceMove, IGameBoard } from './IGameBoard'
import { IGameBoardView } from './IGameBoardView'
import { getLegalMovesFromField } from './LegalMovesFactory'
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
        const bestMove = this.minMax(this._gameBoard.gameBoard, 2, true, this.ownedPlayer) as BestMove


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
        const { x, y } = this.getRandomFieldPosition(f => f.isPlayable)

        const enemyFields: IField[] = []

        this._game.gameBoard.each(v =>
        {
            if (!this.ownedPlayer.doesOwnThisField(v))
                enemyFields.push(v)
        })

        const availablePlaceMoves: {afterPlaceMove: AfterPlaceMove, x: number, y: number}[] = []

        enemyFields.forEach(v =>
        {
            const afterPlaceMove = this._game.gameBoard.getBoardAfterPlace(v.x, v.y, this.ownedPlayer)

            availablePlaceMoves.push({afterPlaceMove, x: v.x, y: v.y})
        })

        availablePlaceMoves.sort((a, b) => evaluateMove(a.afterPlaceMove.gameBoard, null, this.ownedPlayer, this._game).value - evaluateMove(b.afterPlaceMove.gameBoard, null, this.ownedPlayer, this._game).value)

        const best = availablePlaceMoves[0]


        this._game.placeField(best.x, best.y, this.ownedPlayer)
    }

    private minMax(board: IGameBoard, depth: number, isMaximizingPlayer: boolean, player: IPlayer, afterPlaceMove?: AiMove): JustMinMaxValue | BestMove
    {
        if (depth === 0 || board.countPlayersFields(this._game.getNextPlayer(player)) === 0)
            return evaluateMove(board, afterPlaceMove, player, this._game)

        if (isMaximizingPlayer)
        {
            let maxEval = -Infinity

            const movesAndCount = this.getAvailableMoves(board, player)
            const moves = movesAndCount.aiMoves
            if (moves.length < 1)
                return { value: 0 }

            let bestMove = moves[0].move
            let x = 0
            let y = 0
            let redCount = 0
            let greenCount = 0
            let shouldPlaceSomething = false

            for (let i = 0; i < moves.length; i++)
            {
                const current = this.minMax(moves[i].gameBoardAfterMove, depth - 1, false, this._game.getNextPlayer(player), movesAndCount.aiMoves[i])
                if (current.value > maxEval)
                {
                    maxEval = current.value
                    bestMove = moves[i].move
                    x = moves[i].x
                    y = moves[i].y
                    shouldPlaceSomething = moves[i].shouldPlaceSomething
                    redCount = moves[i].redCount
                    greenCount = moves[i].greenCount
                }
            }

            return { bestMove, value: maxEval, x, y, shouldPlaceSomething, redCount, greenCount }
        } else
        {
            let minEval = Infinity

            const movesAndCount = this.getAvailableMoves(board, player)
            const moves = movesAndCount.aiMoves

            if (moves.length < 1)
                return { value: 0 }

            let bestMove = moves[0].move
            let x = 0
            let y = 0
            let shouldPlaceSomething = false
            let redCount = 0
            let greenCount = 0

            for (let i = 0; i < moves.length; i++)
            {
                const current = this.minMax(moves[i].gameBoardAfterMove, depth - 1, true, this._game.getNextPlayer(player), movesAndCount.aiMoves[i])

                if (current.value < minEval)
                {
                    minEval = current.value
                    bestMove = moves[i].move
                    x = moves[i].x
                    y = moves[i].y
                    shouldPlaceSomething = moves[i].shouldPlaceSomething
                    redCount = moves[i].redCount
                    greenCount = moves[i].greenCount
                }
            }

            return { bestMove, value: minEval, x, y, shouldPlaceSomething, greenCount, redCount }
        }
    }

    private getAvailableMoves(board: IGameBoard, player: IPlayer)
    {
        let moves: Move[] = []

        const yourFields: IField[] = []
        const enemyFields: IField[] = []

        board.each(v =>
        {
            if (this.ownedPlayer.doesOwnThisField(v))
                yourFields.push(v)
            else
                enemyFields.push(v)
        })

        moves = yourFields.flatMap(v => getLegalMovesFromField(board, v.x, v.y))

        const aiMoves: AiMove[] = moves.map(move =>
        {

            const fieldFrom = board.getFieldAt(move.x, move.y)
            const fieldTo = board.getFieldAt(move.x + move.direction.x * move.moveCount, move.y + move.direction.y * move.moveCount)

            const gameBoardAfterMove = board.getBoardAfterMove(fieldFrom, fieldTo, player)

            return { gameBoardAfterMove: gameBoardAfterMove.gameBoard, move, shouldPlaceSomething: false, x: 0, y: 0, greenCount: gameBoardAfterMove.greenCount, redCount: gameBoardAfterMove.redCount } as AiMove
        })

        const afterPlaceMoves: AfterPlaceMove[] = []

        enemyFields.forEach(v =>
        {
            const afterPlaceMove = board.getBoardAfterPlace(v.x, v.y, player)

            if (player.state === FieldState.Green && afterPlaceMove.greenCount > 0)
                aiMoves.push({ shouldPlaceSomething: true, x: v.x, y: v.y, gameBoardAfterMove: afterPlaceMove.gameBoard, redCount: afterPlaceMove.redCount, greenCount: afterPlaceMove.greenCount })
            else if (player.state === FieldState.Red && afterPlaceMove.redCount > 0)
                aiMoves.push({ shouldPlaceSomething: true, x: v.x, y: v.y, gameBoardAfterMove: afterPlaceMove.gameBoard, redCount: afterPlaceMove.redCount, greenCount: afterPlaceMove.greenCount })

            afterPlaceMoves[aiMoves.length - 1] = afterPlaceMove
        })


        return { aiMoves, afterPlaceMoves }
    }
}