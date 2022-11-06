import { AiController } from './AiController'
import { EventMouseLeaveField, EventMouseOverField, IFieldView } from './FieldView'
import { IFocus } from './IFocus'
import { IPlayer, Player } from './Player'
import { IGameBoardView } from './IGameBoardView'
import { IReserveView } from './ReserveView'
import { Direction } from './IField'


/**
 * Class responsible for managing owning player turn.
 * Works by hook to gameBoard and IFieldView events
 */
export default class PlayerAiController extends AiController
{
    private selectedField?: IFieldView

    constructor(player: Player, game: IFocus, gameBoard: IGameBoardView)
    {
        super(player, game, gameBoard)

        this.selectedField = undefined

        this.gameBoard.each(v => this.hookIntoClickEvent(v))

        this.gameBoard.addPoolClickedListener(this.onPoolClicked, this)

        this.gameBoard.each(v => v.events.on(EventMouseOverField, this.onMouseOverFieldView, this))
        this.gameBoard.each(v => v.events.on(EventMouseLeaveField, this.onMouseLeaveFieldView, this))
    }

    onMouseOverFieldView(player: IPlayer, fieldView: IFieldView): void
    {
        this.tintHoveredField(player, fieldView)
    }

    onMouseLeaveFieldView(player: IPlayer, fieldView: IFieldView): void
    {
        this.clearTintFromHoveredField(player, fieldView)
    }

    private _usedPool = false

    onPoolClicked(player: IPlayer, reserve: IReserveView): void
    {
        if (this.isTurnOfPlayer(player))
        {
            if (this._usedPool) {
                reserve.addToReserve()
                this._usedPool = false
                return
            }

            this._usedPool = !this._usedPool
            if (reserve.removeFromReserve())
            {
                this.gameBoardController.placePoolState(this.ownedPlayer, this)
            }
        }
    }

    onFieldViewClick(fieldView: IFieldView): void
    {
        try
        {
            this.selectField(fieldView)
        } catch (e)
        {
            const exception = e as unknown as Error
            console.log(exception.message)
        }
    }

    private isTurnOfPlayer(player: IPlayer)
    {
        const { currentPlayer } = this.game

        return currentPlayer === player
    }

    private tintHoveredField(player: IPlayer, field: IFieldView)
    {
        if (this.canBeTinted(field))
        {
            field.visualizeHovered()
        }
    }

    private canBeTinted(field: IFieldView)
    {
        const { currentPlayer } = this.game

        return this.isTurnOfPlayer(this.ownedPlayer) && currentPlayer.doesOwnThisField(field.field) && !this.selectedField
    }

    private clearTintFromHoveredField(player: IPlayer, field: IFieldView)
    {
        if (this.canBeTinted(field))
        {
            field.visualizeUnhovered()
        }
    }

    private hookIntoClickEvent(v: IFieldView)
    {
        v.addClickListener(this.onFieldViewClick, this, true)
    }

    move(): void
    {
        console.log('player move')
    }

    stopMoving(): void
    {
        __dirname
    }

    private selectField(clickedField: IFieldView)
    {
        if (!this.isAbleToMoveThisField(clickedField))
            return

        if (!this.gameBoard.isSomethingSelected)
            this.gameBoard.erasePossibleMoves()

        if (!this.selectedField)
        {
            this.clickedFirstTime(clickedField)
            return
        }

        this.onClickedWhenSomethingSelected(clickedField)
    }

    private isAbleToMoveThisField(clickedField: IFieldView)
    {
        const wasSomethingSelected = !!this.selectedField
        const doesBelongToYou = this.ownedPlayer.doesOwnThisField(clickedField.field)

        return this.isTurnOfPlayer(this.ownedPlayer) && (doesBelongToYou || wasSomethingSelected)
    }

    private clickedFirstTime(clickedField: IFieldView)
    {
        if (!this.ownedPlayer.doesOwnThisField(clickedField.field))
        {
            return
        }

        this.selectNewField(clickedField)
    }

    private selectNewField(clickedField: IFieldView)
    {
        this.selectedField = clickedField
        clickedField.visualizeHovered()
        console.log(clickedField.domElement.className)

        this.gameBoard.renderPossibleMoves(this.selectedField)
    }

    private onClickedWhenSomethingSelected(clickedField: IFieldView)
    {

        // respond for double click
        if (this.wasDoubleClicked(clickedField))
        {
            this.unselectField()
            return
        }

        const direction = this.selectedField?.field.getDirectionToField(clickedField.field)


        if (!direction)
        {
            // field is on diagonal or too far away
            console.warn('Tried to move more than is available in this time')
            this.unselectField()
            return
        }

        this.moveToField(clickedField, direction)
    }

    private wasDoubleClicked(clickedField: IFieldView)
    {
        return this.selectedField === clickedField
    }

    private moveToField(clickedField: IFieldView, direction: Direction)
    {
        if (!this.selectedField)
            return

        const moveCount = this.selectedField.field.getDistanceToField(clickedField.field)

        this.game.moveToField(this.selectedField.field.x, this.selectedField.field.y, direction, moveCount)

        this.unselectField()
    }

    onPlaceStateStarted(): void
    {
        if (this.game.currentPlayer === this.ownedPlayer)
        {
            this.gameBoard.each(v => this.enterIntoPlaceState(v))
        }
    }

    private enterIntoPlaceState(field: IFieldView)
    {
        field.backupClickListeners()

        // use click event now for placing instead of moving
        field.addClickListener(this.onPlaceFieldClicked, this, false)
    }

    private onPlaceFieldClicked(field: IFieldView)
    {
        if (!this.ownedPlayer.hasAnyPool)
        {
            console.warn('Tried to place item without any pool')
            this.resetToPlayState(this.ownedPlayer)
            return
        }

        if (!field.field.isPlayable)
        {
            this.resetToPlayState(this.ownedPlayer)
            return
        }

        this.game.placeField(field.field.x, field.field.y, this.ownedPlayer)
        this.resetToPlayState(this.game.currentPlayer)
    }

    private resetToPlayState(newNextPlayer: IPlayer)
    {
        this.gameBoard.each(v => v.restoreClickListeners())
        this.game.currentPlayer = newNextPlayer
        this.unselectField()
    }

    private unselectField()
    {
        this.selectedField?.visualizeUnhovered()
        this.gameBoard.erasePossibleMoves()
        this.selectedField = undefined
    }
}