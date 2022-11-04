import { AiController, IAiController } from "./AiController";
import { IFieldView } from "./FieldView";
import { IGameBoardView } from "./IGameBoardView";
import { IPlayer, Player } from "./Player";

export class GameBoardController {

    static readonly MOVE_AVAILABLE = 'MoveAvailable'

    constructor(private readonly gameBoardView: IGameBoardView, private readonly playerA: IAiController, private readonly playerB: IAiController) {
        playerA.attachGameBoardController(this)
        playerB.attachGameBoardController(this)
    }

    get game() {
        return this.gameBoardView.game
    }

    private playerWhoPlace: IPlayer

    placePoolState(player: IPlayer, aicontroller: IAiController) {
        if (this.game.currentPlayer !== player) {
            return
        }

        if (player.hasAnyPool) {
            aicontroller.onPlaceStateStarted()
        }
    }
}