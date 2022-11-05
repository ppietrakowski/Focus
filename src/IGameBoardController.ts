import { AiController, IAiController } from "./AiController";
import { IFieldView } from "./FieldView";
import { Focus } from "./Game";
import { EventEnemyHasPool, IAddedToPoolListener, IEnemyHasPoolListener } from "./IFocus";
import { IGameBoardView } from "./IGameBoardView";
import { IPlayer, Player } from "./Player";

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
        }
    }
}