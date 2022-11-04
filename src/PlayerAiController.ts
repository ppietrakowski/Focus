import { AiController } from './AiController'
import { FieldView, IFieldView } from './FieldView'
import { IFocus } from "./IFocus"
import { IPlayer, Player } from './Player'
import { IGameBoardView } from './IGameBoardView'
import { GameBoardView } from './GameBoardView'
import { IReserveView } from './ReserveView'


/**
 * Class responsible for managing owning player turn.
 * Works by hook to gameBoard and IFieldView events
 */
export default class PlayerAiController extends AiController {

    private selectedField: IFieldView

    constructor(player: Player, game: IFocus, gameBoard: IGameBoardView) {
        super(player, game, gameBoard)

        this.selectedField = null

        this.gameBoard.each(v => this.hookIntoClickEvent(v))

        this.gameBoard.events.on(GameBoardView.POOL_CLICKED, this.poolClicked, this)

        this.gameBoard.each(v => v.events.on(FieldView.FieldMouseOver, this.tintHoveredField, this))
        this.gameBoard.each(v => v.events.on(FieldView.FieldMouseLeave, this.clearTintFromHoveredField, this))
    }

    private poolClicked(player: IPlayer, reserve: IReserveView) {
        if (this.isTurnOfPlayer(player)) {
            if (reserve.removeFromReserve()) {
                this.gameBoardController.placePoolState(this.ownedPlayer, this)
            }
        }
    }

    private isTurnOfPlayer(player: IPlayer) {
        const {currentPlayer} = this.game

        return currentPlayer === player
    }

    private tintHoveredField(player: IPlayer, field: IFieldView) {
        const {currentPlayer} = this.game

        if (this.isTurnOfPlayer(player) && currentPlayer.doesOwnThisField(field.field)) {
            field.visualizeHovered()
        }
    }

    private clearTintFromHoveredField(player: IPlayer, field: IFieldView) {
        const {currentPlayer} = this.game
        if (this.isTurnOfPlayer(player) && currentPlayer.doesOwnThisField(field.field)) {
            field.visualizeUnhovered()
        }
    }

    private hookIntoClickEvent(v: IFieldView) {
        v.addClickListener(this.selectField, this)
    }

    move(): void {
    }

    stopMoving(): void {
    }

    private selectField(clickedField: IFieldView) {
        this.gameBoard.erasePossibleMoves()

        if (!this.selectedField) {
            this.clickedFirstTime(clickedField)
            return
        }

        this.onClickedWhenSomethingSelected(clickedField)
    }

    private clickedFirstTime(clickedField: IFieldView) {
        if (!clickedField.field.belongsTo(this.game.currentPlayer)) {
            return
        }

        this.selectNewField(clickedField)
    }

    private selectNewField(clickedField: IFieldView) {
        this.selectedField = clickedField
        this.gameBoard.renderPossibleMoves(this.selectedField)

        this.selectedField.visualizeHovered()
    }

    private onClickedWhenSomethingSelected(clickedField: IFieldView) {

        // respond for double click
        if (this.wasDoubleClicked(clickedField)) {
            this.unselectField()
            return
        }

        const direction = this.selectedField.field.calculateDirectionTowards(clickedField.field)

        
        if (!direction) {
            // field is on diagonal or too far away
            console.warn('Tried to move more than is available in this time')
            this.unselectField()
            return
        }

        this.moveToField(clickedField, direction)
    }

    private wasDoubleClicked(clickedField: IFieldView) {
        return this.selectedField === clickedField
    }

    private moveToField(clickedField: IFieldView, direction: { x: number, y: number }) {
        const moveCount = this.selectedField.field.calculateMoveCountTowards(clickedField.field)

        const isAbleToClickedField = this.game.moveToField(this.selectedField.field.x, this.selectedField.field.y, direction, moveCount)

        if (isAbleToClickedField) {
            this.game.nextTurn()
            this.unselectField()
        } else {
            this.unselectField()
        }
    }

    onPlaceStateStarted(): void {
        if (this.game.currentPlayer === this.ownedPlayer) {
            this.gameBoard.each(v => this.enterIntoPlaceState(v))
        }
    }

    private enterIntoPlaceState(field: IFieldView) {
        field.backupClickListeners()

        // use click event now for placing instead of moving
        field.addClickListener(this.onPlaceFieldClicked, this)
    }

    private onPlaceFieldClicked(field: IFieldView) {
        if (!this.ownedPlayer.hasAnyPool) {
            console.warn('Tried to place item without any pool')
            this.resetToPlayState(this.ownedPlayer)
            return
        }

        if (!field.field.isPlayable) {
            this.resetToPlayState(this.ownedPlayer)
            return
        }

        this.ownedPlayer.pooledPawns--
        this.game.placeField(field.field.x, field.field.y, this.ownedPlayer)
        console.log("HERE I AM")
        this.resetToPlayState(this.game.getNextPlayer(this.ownedPlayer))
    }

    private resetToPlayState(newNextPlayer: IPlayer) {
        this.gameBoard.each(v => v.restoreClickListeners())
        this.gameBoard.erasePossibleMoves()

        this.game.currentPlayer = newNextPlayer
    }

    private unselectField() {
        this.selectedField.visualizeUnhovered()
        this.gameBoard.erasePossibleMoves()
        this.selectedField = null
    }
}