import { Focus, PLAYER_GREEN, PLAYER_RED } from "./Game";
import { FieldView } from './FieldView'
import { DIRECTION_EAST, DIRECTION_NORTH, DIRECTION_SOUTH, DIRECTION_WEST } from "./Field";
import { ReserveView } from "./ReserveView";


export class GameBoardView {

    constructor(game) {
        this.gameBoard = game.gameBoard

        /**
         * @type {Focus}
         */
        this.game = game

        /**
         * @type {FieldView[]}
         */
        this.fields = []
        this.board = document.getElementsByClassName('invisibleGameBoard')[0]

        this.greenReserve = new ReserveView(document.getElementsByClassName('reserveGreen')[0], PLAYER_GREEN)
        this.redReserve = new ReserveView(document.getElementsByClassName('reserveRed')[0], PLAYER_RED)

        this.greenReserve.events.on(ReserveView.POOL_CLICKED, () => this.placeDuringPlayerTurn(PLAYER_GREEN, this.greenReserve))
        this.redReserve.events.on(ReserveView.POOL_CLICKED, () => this.placeDuringPlayerTurn(PLAYER_RED, this.redReserve))

        /**
         * @type {FieldView}
         */
        this.selectedField = null

        this.game.events.on(Focus.ENEMY_HAS_POOL, this.switchToPlaceStateAtPlayerTurn, this)
        this.game.events.on(Focus.ADDED_ITEM_TO_POOL, this.addedElementToPool, this)

        this.clickedReserve = false
        this.addedElementToPool(PLAYER_GREEN)
    }

    placeDuringPlayerTurn(player, reserve) {
        if (this.clickedReserve) {
            reserve.addToReserve()
            this.clickedReserve = false
            return
        }
        this.clickedReserve = !this.clickedReserve
        
        reserve.removeFromReserve()
        this.switchToPlaceStateAtPlayerTurn(player)
    }

    addedElementToPool(player) {
        if (player === PLAYER_GREEN)
            this.greenReserve.addToReserve()
        else if (player === PLAYER_RED)
            this.redReserve.addToReserve()
    }

    hookGuiMethods() {
        this.gameBoard.each(
            element => {
                const e = new FieldView(this.game, element)
                this.board.appendChild(e.domElement)
                e.events.on(FieldView.FIELD_CLICK, () => this.checkSelection(e))

                this.fields.push(e)
            }
        )
    }

    checkSelection(clickedField) {
        this.erasePossibleMoves()

        if (!this.selectedField) {
            this.clickedFirstTime(clickedField)
        } else {
            this.clickedWhenSomethingSelected(clickedField)
        }
    }

    switchToPlaceStateAtPlayerTurn(player) {
        if (this.game.currentPlayer === player)
            this.fields.forEach(v => this.enterIntoPlaceState(v, player))
    }

    enterIntoPlaceState(field, playerWhoPlace) {
        field.events.off(FieldView.FIELD_CLICK)
        field.isSelected = false

        // use click event now for placing instead of moving
        field.events.on(FieldView.FIELD_CLICK, () => this.onPlaceFieldClicked(field, playerWhoPlace))
    }

    onPlaceFieldClicked(field, playerWhoPlace) {
        if (!playerWhoPlace.hasAnyPool) {
            this.playerHasNoPoolAvailable(playerWhoPlace);
            return
        }

        if (!field.field.isPlayable) {
            this.resetToPlayState(playerWhoPlace)
            return
        }

        playerWhoPlace.pooledFields--
        this.game.placeField(field.field.x, field.field.y, playerWhoPlace)

        this.resetToPlayState(this.game.getNextPlayer(playerWhoPlace))
    }

    playerHasNoPoolAvailable(playerWhoPlace) {
        console.warn(`Tried to place item without any pool`);
        this.resetToPlayState(playerWhoPlace);
    }

    resetToPlayState(newNextPlayer) {
        this.fields.forEach(v => v.events.off(FieldView.FIELD_CLICK))
        this.fields.forEach(v => v.events.on(FieldView.FIELD_CLICK, () => this.checkSelection(v)))

        this.reRenderBoard()

        this.game.currentPlayer = newNextPlayer
    }

    clickedFirstTime(clickedField) {
        if (!clickedField.field.belongsTo(this.game.currentPlayer))
            return

        this.selectNewField(clickedField)
    }

    selectNewField(clickedField) {
        this.selectedField = clickedField
        this.selectedField.isSelected = true
        this.renderPossibleMoves()

        this.selectedField.visualizeHovered()
    }

    clickedWhenSomethingSelected(clickedField) {
        if (this.wasDoubleClicked(clickedField)) {
            this.unSelectField()
            return
        }

        let direction = this.selectedField.field.calculateDirectionTowards(clickedField.field)

        if (!direction) {
            this.triedToMoveMoreThanItCan();
            return
        }

        this.moveTowardsDirection(clickedField, direction)
    }

    wasDoubleClicked(clickedField) {
        return this.selectedField === clickedField
    }

    triedToMoveMoreThanItCan() {
        console.warn('Tried to move more than is available in this time');
        this.unSelectField();
    }

    moveTowardsDirection(clickedField, direction) {
        let moveCount = this.selectedField.field.calculateMoveCountTowards(clickedField.field)
        this.move(direction, moveCount)
    }

    move(direction, moveCount) {
        const isAvailableToMoveThere = this.game.moveToField(this.selectedField.field.x, this.selectedField.field.y, direction, moveCount)

        if (!isAvailableToMoveThere) {
            this.unSelectField()
            return
        }

        this.game.nextTurn()
        this.unSelectField()
    }

    unSelectField() {
        this.selectedField.isSelected = false
        this.selectedField.visualizeUnhovered()
        this.reRenderBoard()
        this.selectedField = null
    }

    renderPossibleMoves() {
        const selectedField = this.selectedField.field
        const maxPossibleMoves = selectedField.height

        // north & south
        this.renderInSameLine(selectedField, maxPossibleMoves, DIRECTION_NORTH)

        // east & west
        this.renderInSameLine(selectedField, maxPossibleMoves, DIRECTION_WEST)
    }

    renderInSameLine(selectedField, maxPossibleMoves, baseDirection) {
        this.fields.forEach(v => v.updateField())
        for (let i = 1; i <= maxPossibleMoves; i++) {
            const offset = this.game.getOffsetBasedOnDirection(selectedField, baseDirection, i)

            const elements = this.fields.filter(v => v.isInRange(selectedField, offset))

            elements.forEach(v => v.visualizeHovered())
        }
    }

    erasePossibleMoves() {
        this.fields.forEach(v => v.updateField())
        this.fields.forEach(v => v.visualizeUnhovered())
    }

    reRenderBoard() {
        this.erasePossibleMoves()
    }
}