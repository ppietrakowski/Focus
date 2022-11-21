import { EventNewTurn, IFocus } from './IFocus'
import { IPlayer } from './Player'
import { IGameBoardView } from './IGameBoardView'
import { IAiController, IGameBoardController } from './IGameBoardController'
import { FieldState, IField } from './IField'
import { IPredicate, randomInteger, runTimeout } from './GameUtils'
import { GameBoard } from './GameBoard'


export abstract class AiController implements IAiController {

    readonly ownedPlayer: IPlayer
    protected _gameBoardController: IGameBoardController

    constructor(aiOwnedPlayer: IPlayer, protected readonly _game: IFocus, protected readonly _gameBoard: IGameBoardView) {
        this.ownedPlayer = aiOwnedPlayer
        this._gameBoard = _gameBoard

        this._game.events.on(EventNewTurn, this.checkIsYourTurn, this)
    }

    attachGameBoardController(controller: IGameBoardController): void {
        this._gameBoardController = controller
    }

    abstract move(): Promise<boolean>
    abstract onPlaceStateStarted(): void
    stopMoving(): void {
        this._game
    }
    checkIsYourTurn(player: IPlayer): Promise<void> {
        if (this._game.hasEnded)
            return Promise.resolve()

        if (player == this.ownedPlayer) {
            runTimeout(0.01)
                .then(() => this.move().then(v => this._game.mustEnd = !v))
            //.then(console.trace)
        } else {
            this.stopMoving()
        }

        return Promise.resolve()
    }

    protected getRandomFieldPosition(predicate: IPredicate<IField>) {
        let x = 0
        let y = 0

        while (!predicate(this._game.gameBoard.getFieldAt(x, y))) {
            x = randomInteger(0, GameBoard.GAME_BOARD_WIDTH)
            y = randomInteger(0, GameBoard.GAME_BOARD_HEIGHT)
        }

        return { x, y }
    }
}

export function getPlayerName(player: IPlayer) {

    if (player.state & FieldState.Green)
        return 'Green'
    else if (player.state & FieldState.Red)
        return 'Red'

    return String(undefined).toUpperCase()
}