import { EventNewTurn, IFocus, Move } from './IFocus'
import { IPlayer } from './Player'
import { IGameBoardView } from './IGameBoardView'
import { IAiController, IGameBoardController } from './IGameBoardController'
import { Direction, FieldState, IField } from './IField'
import { IPredicate, randomInteger } from './GameUtils'
import { GameBoard } from './GameBoard'
import { runTimeout } from './Timing'
import { AfterPlaceMove, IGameBoard } from './IGameBoard'
import { evaluateMove } from './EvaluationFunction'

export type PlaceMoveType = {
    afterPlaceMove: AfterPlaceMove
    x: number
    y: number
}

let ownedPlayer: IPlayer = null
let _game: IFocus = null

function availablePlaceMovesComparator(a: PlaceMoveType, b: PlaceMoveType) {
    return evaluateMove(b.afterPlaceMove.gameBoard, ownedPlayer, _game) - evaluateMove(a.afterPlaceMove.gameBoard, ownedPlayer, _game)
}

function enemyFieldToPlaceMoveType(field: IField) {
    return { afterPlaceMove: _game.gameBoard.getBoardAfterPlace(field.x, field.y, ownedPlayer), x: field.x, y: field.y }
}

export abstract class AiController implements IAiController {

    readonly ownedPlayer: IPlayer
    protected _gameBoardController: IGameBoardController
    protected bestMove: Move

    constructor(aiOwnedPlayer: IPlayer, protected readonly _game: IFocus, protected readonly _gameBoard: IGameBoardView) {
        this.ownedPlayer = aiOwnedPlayer
        this._gameBoard = _gameBoard

        this._game.events.on(EventNewTurn, this.checkIsYourTurn, this)
    }

    attachGameBoardController(controller: IGameBoardController): void {
        this._gameBoardController = controller
    }

    move(): boolean {
        if (!this.bestMove && !this.bestMove.shouldPlaceSomething) {
            throw Error('BestMove is not calculated')
        }

        if (this.bestMove.shouldPlaceSomething) {
            console.log(`placed at ${this.bestMove.x}, ${this.bestMove.y}`)
            this._game.placeField(this.bestMove.x, this.bestMove.y, this.ownedPlayer)
            return true
        }

        const pr = this._game.moveToField(this.bestMove.x,
            this.bestMove.y, this.bestMove.direction, this.bestMove.moveCount)

        return pr
    }

    onPlaceStateStarted(): void {
        const enemyFields: IField[] = this._game.gameBoard.filter(f => !this.ownedPlayer.doesOwnThisField(f))

        ownedPlayer = this.ownedPlayer
        _game = this._game

        const availablePlaceMoves: PlaceMoveType[] = enemyFields
            .map(enemyFieldToPlaceMoveType)
            .sort(availablePlaceMovesComparator)

        const best = availablePlaceMoves[0]

        this._game.placeField(best.x, best.y, this.ownedPlayer)
    }

    stopMoving(): void {
        this._game
    }
    checkIsYourTurn(player: IPlayer): Promise<void> {
        if (this._game.hasEnded)
            return Promise.resolve()

        if (player == this.ownedPlayer) {
            runTimeout(0.2)
                .then(() => this.move())
        } else {
            this.stopMoving()
        }

        return Promise.resolve()
    }

    protected getRandomFieldPosition(predicate: IPredicate<IField>): Direction {
        let x = 0
        let y = 0

        while (!predicate(this._game.gameBoard.getFieldAt(x, y))) {
            x = randomInteger(0, GameBoard.GAME_BOARD_WIDTH)
            y = randomInteger(0, GameBoard.GAME_BOARD_HEIGHT)
        }

        return { x, y }
    }

    protected hasReachedEndConditions(board: IGameBoard, depth: number) {
        return board.countPlayersFields(this._game.getNextPlayer(this.ownedPlayer)) === 0 ||
            board.countPlayersFields(this.ownedPlayer) === 0 ||
            depth === 0
    }

    protected calculateOnEndConditions(board: IGameBoard, player: IPlayer) {
        if (board.countPlayersFields(this.ownedPlayer) === 0) {
            // owned player wins
            const result = -evaluateMove(board, player, this._game)
            return result
        }

        const result = evaluateMove(board, player, this._game)
        return result
    }
}

export function getPlayerName(player: IPlayer): string {

    if (player.state & FieldState.Green)
        return 'Green'
    else if (player.state & FieldState.Red)
        return 'Red'

    return String(undefined).toUpperCase()
}