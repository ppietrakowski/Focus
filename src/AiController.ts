import { EventNewTurn, IFocus, Move } from './IFocus'
import { IPlayer } from './Player'
import { IGameBoardView } from './IGameBoardView'
import { IAiController, IGameBoardController } from './IGameBoardController'
import { FieldState, IField } from './IField'
import { runTimeout } from './Timing'
import { AfterPlaceMove, IGameBoard } from './IGameBoard'
import { evaluateMove } from './EvaluationFunction'

export type PlaceMoveType = {
    afterPlaceMove: AfterPlaceMove
    x: number
    y: number
}

function availablePlaceMovesComparator(game: IFocus, ownedPlayer: IPlayer, a: PlaceMoveType, b: PlaceMoveType) {
    return evaluateMove(b.afterPlaceMove.gameBoard, ownedPlayer, game) - evaluateMove(a.afterPlaceMove.gameBoard, ownedPlayer, game)
}

function enemyFieldToPlaceMoveType(game: IFocus, ownedPlayer: IPlayer, field: IField) {
    return { afterPlaceMove: game.gameBoard.getBoardAfterPlace(field.posX, field.posY, ownedPlayer), x: field.posX, y: field.posY }
}

export abstract class AiController implements IAiController {
    readonly ownedPlayer: IPlayer
    protected gameBoardController: IGameBoardController
    protected bestMove: Move
    protected gameBoard: IGameBoard

    constructor(aiOwnedPlayer: IPlayer, protected readonly game: IFocus, protected readonly gameBoardView: IGameBoardView) {
        this.ownedPlayer = aiOwnedPlayer
        this.gameBoardView = gameBoardView
        this.gameBoard = this.gameBoardView.gameBoard

        this.game.events.on(EventNewTurn, this.checkIsYourTurn, this)
    }

    attachGameBoardController(controller: IGameBoardController): void {
        this.gameBoardController = controller
    }

    abstract supplyBestMove(): Move

    move(): boolean {
        this.bestMove = this.supplyBestMove()

        if (!this.bestMove) {
            throw Error('BestMove is not calculated')
        }

        if (this.bestMove.shouldPlaceSomething) {
            console.log(`placed at ${this.bestMove.x}, ${this.bestMove.y}`)
            this.game.placeField(this.bestMove.x, this.bestMove.y, this.ownedPlayer)
            return true
        }

        const pr = this.game.moveToField(this.bestMove.x,
            this.bestMove.y, this.bestMove.direction, this.bestMove.moveCount)

        return pr
    }

    onPlaceStateStarted(): void {
        const enemyFields: IField[] = this.game.gameBoard.filter(f => !this.ownedPlayer.doesOwnThisField(f))

        const availablePlaceMoves: PlaceMoveType[] = enemyFields
            .map(enemyFieldToPlaceMoveType.bind(undefined, this.game, this.ownedPlayer))
            .sort(availablePlaceMovesComparator.bind(undefined, this.game, this.ownedPlayer))

        const best = availablePlaceMoves[0]

        this.game.placeField(best.x, best.y, this.ownedPlayer)
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    stopMoving(): void {
    }

    checkIsYourTurn(player: IPlayer): Promise<void> {
        if (this.game.hasGameEnded)
            return Promise.resolve()

        if (player == this.ownedPlayer) {
            runTimeout(0.2)
                .then(() => this.move())
        } else {
            this.stopMoving()
        }

        return Promise.resolve()
    }

    protected hasReachedEndConditions(board: IGameBoard, depth: number) {
        return board.countPlayersFields(this.game.getNextPlayer(this.ownedPlayer)) === 0 ||
            board.countPlayersFields(this.ownedPlayer) === 0 ||
            depth === 0
    }

    protected calculateOnEndConditions(board: IGameBoard, player: IPlayer) {
        if (board.countPlayersFields(this.ownedPlayer) === 0) {
            // owned player wins
            const result = -evaluateMove(board, player, this.game)
            return result
        }

        const result = evaluateMove(board, player, this.game)
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