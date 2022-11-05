import { Focus } from './Game'
import { IFocus, INewTurnListener } from "./IFocus"
import { IPlayer, Player } from './Player'
import { GameBoardView } from './GameBoardView'
import { IGameBoardView } from './IGameBoardView'
import { GameBoardController } from './IGameBoardController'

export interface IAiController extends INewTurnListener
{
    move(): void
    stopMoving(): void
    checkIsYourTurn(player: IPlayer): void

    attachGameBoardController(controller: GameBoardController): void

    onPlaceStateStarted(): void

    ownedPlayer: IPlayer
}

export abstract class AiController implements IAiController
{

    ownedPlayer: IPlayer
    protected gameBoardController: GameBoardController

    constructor(aiOwnedPlayer: IPlayer, protected readonly game: IFocus, protected readonly gameBoard: IGameBoardView)
    {
        this.ownedPlayer = aiOwnedPlayer
        this.gameBoard = gameBoard


        this.game.addNewTurnListener(this)
    }

    onNextTurnBegin(currentPlayer: IPlayer): void
    {
        this.checkIsYourTurn(currentPlayer)
    }

    attachGameBoardController(controller: GameBoardController): void
    {
        this.gameBoardController = controller
    }

    abstract move(): void
    abstract onPlaceStateStarted(): void
    abstract stopMoving(): void

    checkIsYourTurn(player: IPlayer)
    {
        if (player == this.ownedPlayer)
        {
            this.move()
        } else
        {
            this.stopMoving()
        }
    }
}