import { Focus } from './Game'
import { IFocus } from "./IFocus"
import { IPlayer, Player } from './Player'
import { GameBoardView } from './GameBoardView'
import { IGameBoardView } from './IGameBoardView'

export interface IAiController {
    move(): void
    stopMoving(): void
    checkIsYourTurn(player: IPlayer): void
    
    ownedPlayer: IPlayer
}

export abstract class AiController implements IAiController {

    ownedPlayer: IPlayer

    constructor(aiOwnedPlayer: IPlayer, protected readonly game: IFocus, protected readonly gameBoard: IGameBoardView) {
        this.ownedPlayer = aiOwnedPlayer
        this.gameBoard = gameBoard

        this.game.events.on(Focus.NEXT_TURN, this.checkIsYourTurn, this)
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