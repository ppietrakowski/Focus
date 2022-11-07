import { EventNewTurn, IFocus } from './IFocus'
import { IPlayer } from './Player'
import { IGameBoardView } from './IGameBoardView'
import { IAiController, IGameBoardController } from './IGameBoardController'


export abstract class AiController implements IAiController
{

    readonly ownedPlayer: IPlayer
    protected _gameBoardController: IGameBoardController

    constructor(aiOwnedPlayer: IPlayer, protected readonly _game: IFocus, protected readonly _gameBoard: IGameBoardView)
    {
        this.ownedPlayer = aiOwnedPlayer
        this._gameBoard = _gameBoard

        this._game.events.on(EventNewTurn, this.checkIsYourTurn, this)
    }

    attachGameBoardController(controller: IGameBoardController): void
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