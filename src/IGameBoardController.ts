import { IAiController } from './AiController'
import { EventEnemyHasPool, IEnemyHasPoolListener } from './IFocus'
import { IGameBoardView } from './IGameBoardView'
import { IPlayer } from './Player'

export class GameBoardController implements IEnemyHasPoolListener
{

    static readonly MOVE_AVAILABLE = 'MoveAvailable'

    constructor(private readonly gameBoardView: IGameBoardView, private readonly playerA: IAiController, private readonly playerB: IAiController)
    {
        playerA.attachGameBoardController(this)
        playerB.attachGameBoardController(this)

        this.game.events.on(EventEnemyHasPool, this.onEnemyHasPool, this)
    }

    onEnemyHasPool(enemy: IPlayer): void
    {
        console.log('ff')
        
        this.game.hasPoolToPut = true

        if (this.game.currentPlayer !== enemy)
            this.game.nextTurn()

        this.switchToPoolState(enemy)
    }

    get game()
    {
        return this.gameBoardView.game
    }

    switchToPoolState(player: IPlayer)
    {
        console.log(player)

        if (player === this.playerA.ownedPlayer)
        {
            this.placePoolState(player, this.playerA)
        } else
        {
            this.placePoolState(player, this.playerB)
        }
    }

    private playerWhoPlace: IPlayer

    placePoolState(player: IPlayer, aicontroller: IAiController)
    {
        if (this.game.currentPlayer !== player)
        {
            return
        }

        if (player.hasAnyPool)
        {
            aicontroller.onPlaceStateStarted()
            this.game.hasPoolToPut = false
        }
    }
}