import { IAiController } from "./AiController";
import { FieldView, IFieldView } from "./FieldView";
import { GameBoardView } from "./GameBoardView";
import { IField } from "./IField";
import { IGameBoardView } from "./IGameBoardView";
import { IPlayer } from "./Player";
import { IReserveView } from "./ReserveView";

interface AnyFunction {
    (...args: any[]): void
}
export class GameBoardController {

    static readonly MOVE_AVAILABLE = 'MoveAvailable'

    constructor(private readonly gameBoardView: IGameBoardView, private readonly playerA: IAiController, private readonly playerB: IAiController) {
        this.installCallbacks()

        this.game.currentPlayer.pooledPawns++
        this.gameBoardView.redReserve.addToReserve()    
    }


    private installCallbacks() {
        this.gameBoardView.events.on(GameBoardView.POOL_CLICKED, this.poolClicked, this)

        this.gameBoardView.each(v => v.events.on(FieldView.FieldMouseOver, this.onMouseOverField, this))
        this.gameBoardView.each(v => v.events.on(FieldView.FieldMouseLeave, this.onMouseLeaveField, this))

    }

    private poolClicked(player: IPlayer, reserve: IReserveView) {
        if (this.isTurnOfPlayer(player)) {
            reserve.removeFromReserve()
            this.switchToPlaceStateAtPlayerTurn(player)
        }
    }

    private onMouseOverField(player: IPlayer, field: IFieldView) {
        const {currentPlayer} = this.gameBoardView.game

        if (this.isTurnOfPlayer(player) && currentPlayer.doesOwnThisField(field.field)) {
            field.visualizeHovered()
        }
    }

    private onMouseLeaveField(player: IPlayer, field: IFieldView) {
        const {currentPlayer} = this.gameBoardView.game
        if (this.isTurnOfPlayer(player) && currentPlayer.doesOwnThisField(field.field)) {
            field.visualizeUnhovered()
        }
    }

    get game() {
        return this.gameBoardView.game
    }

    private isTurnOfPlayer(player: IPlayer) {
        const {currentPlayer} = this.gameBoardView.game

        return currentPlayer === player
    }

    private playerWhoPlace: IPlayer

    switchToPlaceStateAtPlayerTurn(player: IPlayer) {
        if (this.game.currentPlayer === player) {
            this.playerWhoPlace = player
            this.gameBoardView.each(v => this.enterIntoPlaceState(v))
        }
    }

    private enterIntoPlaceState(field: IFieldView) {
        field.backupClickListeners()

        // use click event now for placing instead of moving
        field.addClickListener(this.onPlaceFieldClicked, this)
    }

    onPlaceFieldClicked(field: IFieldView) {
        if (!this.playerWhoPlace) {
            throw new Error('Trying to place field without set player who place')
        }
        
        if (!this.playerWhoPlace.hasAnyPool) {
            this.playerHasNoPoolAvailable(field, this.playerWhoPlace)
            return
        }

        if (!field.field.isPlayable) {
            this.resetToPlayState(field, this.playerWhoPlace)
            return
        }

        this.playerWhoPlace.pooledPawns--
        this.game.placeField(field.field.x, field.field.y, this.playerWhoPlace)

        this.resetToPlayState(field, this.game.getNextPlayer(this.playerWhoPlace))
    }

    private playerHasNoPoolAvailable(field: IFieldView, playerWhoPlace: IPlayer) {
        console.warn('Tried to place item without any pool')
        this.resetToPlayState(field, playerWhoPlace)
    }

    private resetToPlayState(field: IFieldView, newNextPlayer: IPlayer) {
        this.gameBoardView.each(v => v.restoreClickListeners())
        this.gameBoardView.erasePossibleMoves()

        this.game.currentPlayer = newNextPlayer
    }
}