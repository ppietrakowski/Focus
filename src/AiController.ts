import { Focus } from './Game'
import { EventNewTurn, IFocus, INewTurnListener } from './IFocus'
import { IPlayer, Player } from './Player'
import { GameBoardView } from './GameBoardView'
import { IGameBoardView } from './IGameBoardView'
import { GameBoardController } from './GameBoardController'

export interface IAiController
{
    move(): void
    stopMoving(): void
    checkIsYourTurn(player: IPlayer): void

    attachGameBoardController(controller: GameBoardController): void

    onPlaceStateStarted(): void

    readonly ownedPlayer: IPlayer
}

export abstract class AiController implements IAiController
{

    readonly ownedPlayer: IPlayer
    protected _gameBoardController: GameBoardController

    constructor(aiOwnedPlayer: IPlayer, protected readonly _game: IFocus, protected readonly _gameBoard: IGameBoardView)
    {
        this.ownedPlayer = aiOwnedPlayer
        this._gameBoard = _gameBoard

        this._game.events.on(EventNewTurn, this.checkIsYourTurn, this)
    }

    attachGameBoardController(controller: GameBoardController): void
    {
        this._gameBoardController = controller
    }

    abstract move(): void
    abstract onPlaceStateStarted(): void
    abstract stopMoving(): void

    checkIsYourTurn(player: IPlayer)
    {
        if (this._game.hasEnded)
            return
            
        if (player == this.ownedPlayer)
        {
            this.move()
        } else
        {
            this.stopMoving()
        }
    }
}