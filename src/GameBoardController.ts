import { PLAYER_GREEN, PLAYER_RED } from './Game'
import { runTimeout } from './GameUtils'
import { EventEnemyHasPool, EventVictory } from './IFocus'
import { IAiController, IGameBoardController } from './IGameBoardController'
import { IGameBoardView } from './IGameBoardView'
import { IPlayer } from './Player'

function logIllegalMove()
{
    console.warn('illegal move')
}

export class GameBoardController implements IGameBoardController
{
    static readonly MOVE_AVAILABLE = 'MoveAvailable'

    constructor(private readonly _gameBoardView: IGameBoardView, private readonly _playerA: IAiController, private readonly _playerB: IAiController)
    {
        _playerA.attachGameBoardController(this)
        _playerB.attachGameBoardController(this)

        this.game.events.on(EventEnemyHasPool, this.onEnemyHasPool, this)
        this.game.events.on(EventVictory, () => _gameBoardView.erasePossibleMoves())
    }

    start(): void
    {
        if (this._playerA.ownedPlayer === this.game.currentPlayer)
            this._playerA.checkIsYourTurn(this.game.currentPlayer).catch(logIllegalMove)
        else
            this._playerB.checkIsYourTurn(this.game.currentPlayer).catch(logIllegalMove)

        this.game.nextTurn()

        //requestAnimationFrame(this.start.bind(this))
    }

    get game()
    {
        return this._gameBoardView.game
    }

    private onEnemyHasPool(enemy: IPlayer): void
    {
        this.game.setHasPoolToPut()

        if (this.game.currentPlayer !== enemy)
            this.game.nextTurn()

        this.switchToPoolState(enemy)
    }

    switchToPoolState(player: IPlayer)
    {
        if (player === this._playerA.ownedPlayer)
        {
            this.placePoolState(player, this._playerA)
        } else
        {
            this.placePoolState(player, this._playerB)
        }
    }

    placePoolState(player: IPlayer, aicontroller: IAiController)
    {
        if (this.game.currentPlayer !== player)
        {
            return
        }

        if (player.hasAnyPool)
        {
            aicontroller.onPlaceStateStarted()
        }
    }
}