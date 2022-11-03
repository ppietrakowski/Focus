import { Focus, PLAYER_GREEN, PLAYER_RED } from "./Game";
import { FieldView } from './FieldView'
import { DIRECTION_EAST, DIRECTION_NORTH, DIRECTION_SOUTH, DIRECTION_WEST, Field } from "./Field";
import { IReserveView, ReserveView } from "./ReserveView";
import { Player } from "./Player";
import { ReserveViewRequest } from "./ReserveViewRequest";
import { AiController } from "./AiController";
import PlayerAiController from "./PlayerAiController";
import { GameBoard } from "./GameBoard";


export class GameBoardView {

    game: Focus
    gameBoard: GameBoard
    fields: FieldView[]
    board: HTMLDivElement
    greenReserve: IReserveView
    redReserve: IReserveView

    private selectedField: FieldView
    private playerWhoPlace: Player
    private clickedReserve: boolean
    private red: AiController
    private green: AiController

    constructor(game: Focus) {
        this.gameBoard = game.gameBoard

        this.game = game
        this.fields = []
        this.board = document.getElementsByClassName('virtualGameBoard')[0] as HTMLDivElement

        this.greenReserve = new ReserveView(document.getElementsByClassName('reserveGreen')[0] as HTMLDivElement, PLAYER_GREEN)
        this.redReserve = new ReserveView(document.getElementsByClassName('reserveRed')[0] as HTMLDivElement, PLAYER_RED)

        this.greenReserve = new ReserveViewRequest(this.greenReserve, this.game)
        this.redReserve = new ReserveViewRequest(this.redReserve, this.game)
        
        this.greenReserve.events.on(ReserveView.POOL_CLICKED, () => this.placeDuringPlayerTurn(PLAYER_GREEN, this.greenReserve))
        this.redReserve.events.on(ReserveView.POOL_CLICKED, () => this.placeDuringPlayerTurn(PLAYER_RED, this.redReserve))

        this.selectedField = null

        this.playerWhoPlace = null

        this.game.events.on(Focus.ENEMY_HAS_POOL, this.switchToPlaceStateAtPlayerTurn, this)
        this.game.events.on(Focus.ADDED_ITEM_TO_POOL, this.addedElementToPool, this)

        this.clickedReserve = false

        this.red = new PlayerAiController(PLAYER_RED, game, this)
        this.green = new PlayerAiController(PLAYER_GREEN, game, this)

        console.log(this.red)
        console.log(this.green)
    }

    placeDuringPlayerTurn(player: Player, reserve: IReserveView) {
        if (this.clickedReserve) {
            return this.clickedTwiceOnReserve(reserve)
        }

        this.clickedReserve = !this.clickedReserve
        
        reserve.removeFromReserve()
        this.switchToPlaceStateAtPlayerTurn(player)
    }

    clickedTwiceOnReserve(reserve: IReserveView) {
        reserve.addToReserve()
        this.clickedReserve = false
        return
    }

    addedElementToPool() {
        this.greenReserve.addToReserve()
        this.redReserve.addToReserve()
    }

    hookGuiMethods() {
        this.gameBoard.each(
            element => {
                const e = new FieldView(this.game, element)
                this.board.appendChild(e.domElement)
                e.events.on(FieldView.FIELD_CLICK, this.checkSelection, this)

                this.fields.push(e)
            }
        )
    }

    emitSelection(clickedField: FieldView) {
        this.game.events.emit('selectedField', clickedField, this.game.currentPlayer)
    }

    checkSelection(clickedField: FieldView) {
        this.erasePossibleMoves()

        if (!this.selectedField) {
            this.clickedFirstTime(clickedField)
            return
        }

        this.clickedWhenSomethingSelected(clickedField)
    }

    switchToPlaceStateAtPlayerTurn(player: Player) {
        if (this.game.currentPlayer === player) {
            this.playerWhoPlace = player
            this.fields.forEach(v => this.enterIntoPlaceState(v))
        }
    }

    enterIntoPlaceState(field: FieldView) {
        field.events.off(FieldView.FIELD_CLICK)
        field.isSelected = false

        // use click event now for placing instead of moving
        field.events.on(FieldView.FIELD_CLICK, this.onPlaceFieldClicked, this)
    }

    onPlaceFieldClicked(field: FieldView) {

        if (!this.playerWhoPlace) {
            throw new Error('Trying to place field without set player who place')
        }
        
        if (!this.playerWhoPlace.hasAnyPool) {
            this.playerHasNoPoolAvailable(this.playerWhoPlace);
            return
        }

        if (!field.field.isPlayable) {
            this.resetToPlayState(this.playerWhoPlace)
            return
        }

        this.playerWhoPlace.pooledPawns--
        this.game.placeField(field.field.x, field.field.y, this.playerWhoPlace)

        this.resetToPlayState(this.game.getNextPlayer(this.playerWhoPlace))
    }

    playerHasNoPoolAvailable(playerWhoPlace: Player) {
        console.warn(`Tried to place item without any pool`);
        this.resetToPlayState(playerWhoPlace);
    }

    resetToPlayState(newNextPlayer: Player) {
        this.fields.forEach(v => v.events.off(FieldView.FIELD_CLICK))
        this.fields.forEach(v => v.events.on(FieldView.FIELD_CLICK, () => this.checkSelection(v)))

        this.reRenderBoard()

        this.game.currentPlayer = newNextPlayer
    }

    clickedFirstTime(clickedField: FieldView) {
        if (!clickedField.field.belongsTo(this.game.currentPlayer)) {
            return
        }

        this.selectNewField(clickedField)
    }

    selectNewField(clickedField: FieldView) {
        this.selectedField = clickedField
        this.selectedField.isSelected = true
        this.renderPossibleMoves()

        this.selectedField.visualizeHovered()
    }

    clickedWhenSomethingSelected(clickedField: FieldView) {
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

    wasDoubleClicked(clickedField: FieldView) {
        return this.selectedField === clickedField
    }

    triedToMoveMoreThanItCan() {
        console.warn('Tried to move more than is available in this time');
        this.unSelectField();
    }

    moveTowardsDirection(clickedField: FieldView, direction: {x: number, y: number}) {
        let moveCount = this.selectedField.field.calculateMoveCountTowards(clickedField.field)
        this.move(direction, moveCount)
    }

    move(direction: {x: number, y: number}, moveCount: number) {
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
        this.renderInSameLine(maxPossibleMoves, DIRECTION_NORTH)

        // east & west
        this.renderInSameLine(maxPossibleMoves, DIRECTION_WEST)
    }

    renderInSameLine(maxPossibleMoves: number, baseDirection: {x: number, y: number}) {
        for (let i = 1; i <= maxPossibleMoves; i++) {
            this.selectNeighboursInRange(baseDirection, i);
        }
    }

    selectNeighboursInRange(baseDirection: {x: number, y: number}, maxRange: number) {
        const {field} = this.selectedField
        
        const offset = this.game.getOffsetBasedOnDirection(field, baseDirection, maxRange)

        const elements = this.fields.filter(v => v.isInRange(field, offset))

        elements.forEach(v => v.visualizeHovered())
    }

    erasePossibleMoves() {
        this.fields.forEach(v => v.visualizeUnhovered())
    }

    reRenderBoard() {
        this.erasePossibleMoves()
    }
}