import { Focus } from './Game'
import { IFocus } from "./IFocus"
import { IPlayer, Player } from './Player'
import { GameBoardView } from './GameBoardView'
import { IGameBoardView } from './IGameBoardView'
import { GameBoardController } from './IGameBoardController'

export interface IAiController {
    move(): void
    stopMoving(): void
    checkIsYourTurn(player: IPlayer): void
    
    attachGameBoardController(controller: GameBoardController): void

    ownedPlayer: IPlayer
}

export abstract class AiController implements IAiController {

    ownedPlayer: IPlayer
    protected gameBoardController: GameBoardController

    constructor(aiOwnedPlayer: IPlayer, protected readonly game: IFocus, protected readonly gameBoard: IGameBoardView) {
        this.ownedPlayer = aiOwnedPlayer
        this.gameBoard = gameBoard

        this.game.events.on(Focus.NEXT_TURN, this.checkIsYourTurn, this)
    }

    attachGameBoardController(controller: GameBoardController): void {
        this.gameBoardController = controller
    }

    abstract move(): void

    abstract stopMoving(): void

    checkIsYourTurn(player: IPlayer) {
        if (player == this.ownedPlayer) {
            this.move()
        } else {
            this.stopMoving()
        }
    }
}