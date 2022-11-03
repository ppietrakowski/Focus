import { Focus } from "./Game"
import { Player } from "./Player"
import { GameBoardView } from "./GameBoardView"

export class AiController {

    ownedPlayer: Player

    constructor(aiOwnedPlayer: Player, protected readonly game: Focus, protected readonly gameBoard: GameBoardView) {
        this.ownedPlayer = aiOwnedPlayer
        this.gameBoard = gameBoard

        this.game.events.on(Focus.NEXT_TURN, this.checkIsYourTurn, this)
    }

    move() {
    }

    stopMoving() {

    }

    checkIsYourTurn(player: Player) {
        if (player == this.ownedPlayer) {
            this.move()
        } else {
            this.stopMoving()
        }
    }
}