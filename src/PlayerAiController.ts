import { AiController, getPlayerName } from './AiController'
import { EventMouseLeaveField, EventMouseOverField, IFieldView } from './FieldView'
import { IFocus, Move } from './IFocus'
import { IPlayer } from './Player'
import { IGameBoardView } from './IGameBoardView'
import { IReserveView } from './IReserveView'
import { Direction } from './IField'
import { PLAYER_RED } from './Game'


function isValidDirection(direction: Direction): boolean {
    return direction.x !== 0 || direction.y !== 0
}

/**
 * Class responsible for managing owning player turn.
 * Works by hook to gameBoard and IFieldView events
 */
export default class PlayerAiController extends AiController {

    private selectedField: IFieldView | null
    private usedPool = false

    constructor(player: IPlayer, game: IFocus, gameBoard: IGameBoardView) {
        super(player, game, gameBoard)

        this.selectedField = null

        this.gameBoardView.each(v => this.hookIntoClickEvent(v))

        this.gameBoardView.addPoolClickedListener(this.onPoolClicked, this)

        this.gameBoardView.each(v => v.events.on(EventMouseOverField, this.onMouseOverFieldView, this))
        this.gameBoardView.each(v => v.events.on(EventMouseLeaveField, this.onMouseLeaveFieldView, this))
    }

    private onMouseOverFieldView(fieldView: IFieldView): void {
        this.tintHoveredField(fieldView)
    }

    private onMouseLeaveFieldView(fieldView: IFieldView): void {
        this.clearTintFromHoveredField(fieldView)
    }

    private onPoolClicked(player: IPlayer, reserve: IReserveView): void {
        if (this.isTurnOfPlayer(player)) {
            console.log(`clicked ${getPlayerName(player)}`)
            if (this.usedPool) {
                reserve.addToReserve(player)
                this.usedPool = false
                return
            }

            this.usedPool = !this.usedPool
            this.gameBoardController.placePoolState(this.ownedPlayer, this)
        }
    }

    private onFieldViewClick(fieldView: IFieldView): void {
        this.selectField(fieldView)
    }

    private isTurnOfPlayer(player: IPlayer): boolean {
        const { currentPlayingColor: currentPlayer } = this.game

        return currentPlayer === player
    }

    private tintHoveredField(field: IFieldView): void {
        if (this.canBeTinted(field)) {
            field.visualizeHovered()
        }
    }

    private canBeTinted(field: IFieldView): boolean {
        const { currentPlayingColor: currentPlayer } = this.game

        return this.isTurnOfPlayer(this.ownedPlayer) && currentPlayer.doesOwnThisField(field.field) && !this.selectedField
    }

    private clearTintFromHoveredField(field: IFieldView): void {
        if (this.canBeTinted(field)) {
            field.visualizeUnhovered()
        }
    }

    private hookIntoClickEvent(fieldView: IFieldView): void {
        fieldView.addClickListener(this.onFieldViewClick, this, true)
    }

    supplyBestMove(): Move {
        return null
    }

    move(): boolean {
        return true
    }

    private selectField(clickedField: IFieldView): void {
        if (!this.isAbleToMoveThisField(clickedField))
            return

        if (!this.gameBoardView.isSomethingSelected)
            this.gameBoardView.erasePossibleMoves()

        if (!this.selectedField) {
            this.clickedFirstTime(clickedField)
            return
        }

        this.onClickedWhenSomethingSelected(clickedField)
    }

    private isAbleToMoveThisField(clickedField: IFieldView): boolean {
        const wasSomethingSelected = !!this.selectedField
        const doesBelongToYou = this.ownedPlayer.doesOwnThisField(clickedField.field)

        return this.isTurnOfPlayer(this.ownedPlayer) && (doesBelongToYou || wasSomethingSelected)
    }

    private clickedFirstTime(clickedField: IFieldView): void {
        if (!this.ownedPlayer.doesOwnThisField(clickedField.field)) {
            return
        }

        this.selectNewField(clickedField)
    }

    private selectNewField(clickedField: IFieldView): void {
        this.selectedField = clickedField
        clickedField.visualizeHovered()

        this.gameBoardView.renderPossibleMoves(this.selectedField)
    }

    checkIsYourTurn(): Promise<void> {
        return Promise.resolve()
    }

    private onClickedWhenSomethingSelected(clickedField: IFieldView): void {

        // respond for double click
        if (this.selectedFieldWasDoubleClicked(clickedField) || this.selectedField === null) {
            this.unselectField()
            return
        }

        const direction = this.selectedField.field.getDirectionToField(clickedField.field)

        if (!isValidDirection(direction)) {
            // field is on diagonal or too far away
            console.warn('Tried to move more than is available in this time')
            this.unselectField()
            return
        }

        this.moveToField(clickedField, direction)
    }

    private selectedFieldWasDoubleClicked(clickedField: IFieldView): boolean {
        return this.selectedField === clickedField
    }

    private moveToField(clickedField: IFieldView, direction: Direction): void {
        if (!this.selectedField)
            return

        const moveCount = this.selectedField.field.getDistanceToField(clickedField.field)

        this.game.moveToField(this.selectedField.field.posX, this.selectedField.field.posY, direction, moveCount)

        this.unselectField()

    }

    onPlaceStateStarted(): void {
        if (this.game.currentPlayingColor === this.ownedPlayer) {
            this.gameBoardView.each(v => this.enterIntoPlaceState(v))
        }
    }

    private enterIntoPlaceState(field: IFieldView): void {
        field.backupClickListeners()

        // use click event now for placing instead of moving
        field.addClickListener(this.onPlaceFieldClicked, this, false)
    }

    private onPlaceFieldClicked(field: IFieldView): void {
        if ((this.ownedPlayer === PLAYER_RED ? this.gameBoardView.gameBoard.redPlayerPawnCount : this.gameBoardView.gameBoard.greenPlayerPawnCount) < 1) {
            console.warn('Tried to place item without any pool')
            this.resetToPlayState(this.ownedPlayer)
            return
        }

        if (!field.field.isPlayable) {
            this.resetToPlayState(this.ownedPlayer)
            return
        }

        console.log('player is going to place something')
        this.game.placeField(field.field.posX, field.field.posY, this.ownedPlayer)
        this.resetToPlayState(this.game.currentPlayingColor)
    }

    private resetToPlayState(newNextPlayer: IPlayer): void {
        this.gameBoardView.each(v => v.restoreClickListeners())
        this.game.currentPlayingColor = newNextPlayer
        this.unselectField()
    }

    private unselectField(): void {
        this.selectedField?.visualizeUnhovered()
        this.gameBoardView.erasePossibleMoves()
        this.selectedField = null
    }
}