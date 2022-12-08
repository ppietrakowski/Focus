import { PLAYER_RED } from './Game'
import { EventEnemyHasPool, EventVictory, IFocus } from './IFocus'
import { IAiController, IGameBoardController } from './IGameBoardController'
import { IGameBoardView } from './IGameBoardView'
import { IPlayer } from './Player'

export class GameBoardController implements IGameBoardController {
    static readonly MOVE_AVAILABLE = 'MoveAvailable'

    constructor(private readonly gameBoardView: IGameBoardView, private readonly playerAController: IAiController, private readonly playerBController: IAiController) {
        playerAController.attachGameBoardController(this)
        playerBController.attachGameBoardController(this)

        this.game.events.on(EventEnemyHasPool, this.onEnemyHasPool, this)
        this.game.events.on(EventVictory, () => gameBoardView.erasePossibleMoves())
    }

    start(): void {
        this.playerAController.checkIsYourTurn(this.game.currentPlayingColor)
    }

    get game(): IFocus {
        return this.gameBoardView.game
    }

    private onEnemyHasPool(enemy: IPlayer): void {
        this.game.setHasPoolToPut()

        if (this.game.currentPlayingColor !== enemy) {
            this.game.nextTurn()
        }

        this.switchToPoolState(enemy)
    }

    switchToPoolState(player: IPlayer): void {
        if (player === this.playerAController.ownedPlayer) {
            this.placePoolState(player, this.playerAController)
        } else {
            this.placePoolState(player, this.playerBController)
        }
    }

    placePoolState(player: IPlayer, aicontroller: IAiController): void {
        if (this.game.currentPlayingColor !== player) {
            return
        }

        if ((player === PLAYER_RED ? this.game.gameBoard.redPlayerPawnCount : this.game.gameBoard.greenPlayerPawnCount) > 0) {
            aicontroller.onPlaceStateStarted()
        }
    }
}