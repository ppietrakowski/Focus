import { getPlayerName } from './AiController'
import { PLAYER_RED } from './Game'
import { EventEnemyHasPool, EventVictory } from './IFocus'
import { IAiController, IGameBoardController } from './IGameBoardController'
import { IGameBoardView } from './IGameBoardView'
import { IPlayer } from './Player'

export class GameBoardController implements IGameBoardController {
    static readonly MOVE_AVAILABLE = 'MoveAvailable'

    constructor(private readonly _gameBoardView: IGameBoardView, private readonly _playerA: IAiController, private readonly _playerB: IAiController) {
        _playerA.attachGameBoardController(this)
        _playerB.attachGameBoardController(this)

        this.game.events.on(EventEnemyHasPool, this.onEnemyHasPool, this)
        this.game.events.on(EventVictory, () => _gameBoardView.erasePossibleMoves())
    }

    start(): void {
        this._playerA.checkIsYourTurn(this.game.currentPlayer)
    }

    get game() {
        return this._gameBoardView.game
    }

    private onEnemyHasPool(enemy: IPlayer): void {
        this.game.setHasPoolToPut()

        console.log('has pool', getPlayerName(enemy))

        if (this.game.currentPlayer !== enemy)
            this.game.nextTurn()

        this.switchToPoolState(enemy)
    }

    switchToPoolState(player: IPlayer) {
        if (player === this._playerA.ownedPlayer) {
            this.placePoolState(player, this._playerA)
        } else {
            this.placePoolState(player, this._playerB)
        }
    }

    placePoolState(player: IPlayer, aicontroller: IAiController) {
        console.log(getPlayerName(player))
        if (this.game.currentPlayer !== player) {
            return
        }
        console.log(getPlayerName(player), 2)

        if ((player === PLAYER_RED ? this.game.gameBoard.redPlayerPawnCount : this.game.gameBoard.greenPlayerPawnCount) > 0) {
            aicontroller.onPlaceStateStarted()
        }
    }
}