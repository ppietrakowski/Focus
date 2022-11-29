import { AiController, getPlayerName } from './AiController'
import { EventMouseLeaveField, EventMouseOverField, IFieldView } from './FieldView'
import { IFocus } from './IFocus'
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
    private _selectedField: IFieldView | null
    private _usedPool = false

    constructor(player: IPlayer, game: IFocus, gameBoard: IGameBoardView) {
        super(player, game, gameBoard)

        this._selectedField = null

        this._gameBoard.each(v => this.hookIntoClickEvent(v))

        this._gameBoard.addPoolClickedListener(this.onPoolClicked, this)

        this._gameBoard.each(v => v.events.on(EventMouseOverField, this.onMouseOverFieldView, this))
        this._gameBoard.each(v => v.events.on(EventMouseLeaveField, this.onMouseLeaveFieldView, this))
    }

    private onMouseOverFieldView(player: IPlayer, fieldView: IFieldView): void {
        this.tintHoveredField(player, fieldView)
    }

    private onMouseLeaveFieldView(player: IPlayer, fieldView: IFieldView): void {
        this.clearTintFromHoveredField(player, fieldView)
    }


    private onPoolClicked(player: IPlayer, reserve: IReserveView): void {
        if (this.isTurnOfPlayer(player)) {
            console.log(`clicked ${getPlayerName(player)}`)
            if (this._usedPool) {
                reserve.addToReserve(player)
                this._usedPool = false
                return
            }

            this._usedPool = !this._usedPool
            this._gameBoardController.placePoolState(this.ownedPlayer, this)
        }
    }

    private onFieldViewClick(fieldView: IFieldView): void {
        this.selectField(fieldView)
        // try {
        //     this.selectField(fieldView)
        // } catch (e) {
        //     const exception = e as unknown as Error
        //     console.log(exception.message)
        // }
    }

    private isTurnOfPlayer(player: IPlayer) {
        const { currentPlayer } = this._game

        return currentPlayer === player
    }

    private tintHoveredField(_player: IPlayer, field: IFieldView) {
        if (this.canBeTinted(field)) {
            field.visualizeHovered()
        }
    }

    private canBeTinted(field: IFieldView) {
        const { currentPlayer } = this._game

        return this.isTurnOfPlayer(this.ownedPlayer) && currentPlayer.doesOwnThisField(field.field) && !this._selectedField
    }

    private clearTintFromHoveredField(_player: IPlayer, field: IFieldView) {
        if (this.canBeTinted(field)) {
            field.visualizeUnhovered()
        }
    }

    private hookIntoClickEvent(fieldView: IFieldView) {
        fieldView.addClickListener(this.onFieldViewClick, this, true)
    }

    move(): Promise<boolean> {
        return Promise.resolve(true)
    }

    stopMoving(): void {
        __dirname
    }

    private selectField(clickedField: IFieldView) {
        if (!this.isAbleToMoveThisField(clickedField))
            return

        if (!this._gameBoard.isSomethingSelected)
            this._gameBoard.erasePossibleMoves()

        if (!this._selectedField) {
            this.clickedFirstTime(clickedField)
            return
        }

        this.onClickedWhenSomethingSelected(clickedField)
    }

    private isAbleToMoveThisField(clickedField: IFieldView) {
        const wasSomethingSelected = !!this._selectedField
        const doesBelongToYou = this.ownedPlayer.doesOwnThisField(clickedField.field)

        return this.isTurnOfPlayer(this.ownedPlayer) && (doesBelongToYou || wasSomethingSelected)
    }

    private clickedFirstTime(clickedField: IFieldView) {
        if (!this.ownedPlayer.doesOwnThisField(clickedField.field)) {
            return
        }

        this.selectNewField(clickedField)
    }

    private selectNewField(clickedField: IFieldView) {
        this._selectedField = clickedField
        clickedField.visualizeHovered()
        console.log(clickedField.domElement.className)

        this._gameBoard.renderPossibleMoves(this._selectedField)
    }

    checkIsYourTurn(): Promise<void> {
        return Promise.resolve()
    }

    private onClickedWhenSomethingSelected(clickedField: IFieldView) {

        // respond for double click
        if (this.selectedFieldWasDoubleClicked(clickedField) || this._selectedField === null) {
            this.unselectField()
            return
        }

        const direction = this._selectedField.field.getDirectionToField(clickedField.field)

        if (!isValidDirection(direction)) {
            // field is on diagonal or too far away
            console.warn('Tried to move more than is available in this time')
            this.unselectField()
            return
        }

        this.moveToField(clickedField, direction)
        //this._game.nextTurn()
    }

    private selectedFieldWasDoubleClicked(clickedField: IFieldView) {
        return this._selectedField === clickedField
    }

    private moveToField(clickedField: IFieldView, direction: Direction) {
        if (!this._selectedField)
            return

        const moveCount = this._selectedField.field.getDistanceToField(clickedField.field)

        this._game.moveToField(this._selectedField.field.x, this._selectedField.field.y, direction, moveCount)

        this.unselectField()

    }

    onPlaceStateStarted(): void {
        if (this._game.currentPlayer === this.ownedPlayer) {
            this._gameBoard.each(v => this.enterIntoPlaceState(v))
        }
    }

    private enterIntoPlaceState(field: IFieldView) {
        field.backupClickListeners()
        console.log(field)

        // use click event now for placing instead of moving
        field.addClickListener(this.onPlaceFieldClicked, this, false)
        console.log(field)
    }

    private onPlaceFieldClicked(field: IFieldView) {
        if ((this.ownedPlayer === PLAYER_RED ? this._gameBoard.gameBoard.redPlayerPawnCount : this._gameBoard.gameBoard.greenPlayerPawnCount) < 1) {
            console.warn('Tried to place item without any pool')
            this.resetToPlayState(this.ownedPlayer)
            return
        }

        console.log('test')

        if (!field.field.isPlayable) {
            this.resetToPlayState(this.ownedPlayer)
            return
        }

        console.log('player is going to place something')
        this._game.placeField(field.field.x, field.field.y, this.ownedPlayer)
        this.resetToPlayState(this._game.currentPlayer)
    }

    private resetToPlayState(newNextPlayer: IPlayer) {
        this._gameBoard.each(v => v.restoreClickListeners())
        this._game.currentPlayer = newNextPlayer
        this.unselectField()
    }

    private unselectField() {
        this._selectedField?.visualizeUnhovered()
        this._gameBoard.erasePossibleMoves()
        this._selectedField = null
    }
}