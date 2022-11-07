import { EventNewTurn, IFocus } from './IFocus'
import { IPlayer } from './Player'
import { IGameBoardView } from './IGameBoardView'
import { IAiController, IGameBoardController } from './IGameBoardController'
import { FieldState } from './IField'


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

    abstract move(): Promise<void>
    abstract onPlaceStateStarted(): void
    stopMoving(): void
    {
        this._game
    }
    

    checkIsYourTurn(player: IPlayer)
    {
        if (this._game.hasEnded)
            return
            
        if (player == this.ownedPlayer)
        {
            setTimeout(() => this.move(), 66)
        } else
        {
            this.stopMoving()
        }
    }
}

function getPlayerName(player: IPlayer) {

    if (player.state & FieldState.Green)
        return 'Green'
    else if (player.state & FieldState.Red)
        return 'Red'
    
    return String(undefined).toUpperCase()
}