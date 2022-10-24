import { FIELD_STATE_PLAYER_A, FIELD_STATE_PLAYER_B, MAX_TOWER_HEIGHT } from "./Field";
import { GameBoard } from "./GameBoard";
import { Player } from "./Player";

const PLAYER_A = new Player(FIELD_STATE_PLAYER_A)
const PLAYER_B = new Player(FIELD_STATE_PLAYER_B)

export class Focus {
    static ADDED_ITEM_TO_POOL = 'addedItemToPool'
    static MOVED_FIELD = 'movedField'
    static VICTORY = 'victory'
    static ENEMY_HAS_POOL = 'enemyHasPool'
    static NEXT_TURN = 'nextTurn'

    constructor() {
        this.gameBoard = new GameBoard()
        this.events = this.gameBoard.events
        this.currentPlayer = PLAYER_A

        this.events.on(Focus.MOVED_FIELD, this.checkForVictoryCondition, this)
    }

    moveToField(x, y, direction, howManyFieldWantMove) {
        let from = this.gameBoard.getFieldAt(x, y)

        if (!from.belongsTo(this.currentPlayer))
            return false


        let toField = this.getFieldBasedOnDirectionAndMoveCount(from, direction, howManyFieldWantMove)
        if (!toField.isPlayable)
            return false

        toField.makeAsNextField(from, howManyFieldWantMove)

        if (toField.isOvergrown)
            this.popElementsToCreateTower(toField)

        this.events.emit(Focus.MOVED_FIELD, x, y, toField, from)
        return true
    }

    placeField(x, y, owner) {
        let field = this.gameBoard.getFieldAt(x, y)

        field.underThisField = this.makeNewUnderAfterPlacing(field, owner)
        field.state = owner.state

        if (field.isOvergrown)
            this.popElementsToCreateTower(field)
    }

    makeNewUnderAfterPlacing(field) {
        let newUnderElements = field.underThisField

        if (!field.isEmpty)
            newUnderElements = [{ state: field.state }].concat(newUnderElements)

        return newUnderElements
    }

    popElementsToCreateTower(toField) {
        while (toField.height > MAX_TOWER_HEIGHT)
            this.popTopElementFromField(toField)
    }

    popTopElementFromField(toField) {
        const field = toField.underThisField.pop()

        if (this.currentPlayer.doesOwnThisField(field))
            this.increaseCurrentPlayersPool()
    }

    increaseCurrentPlayersPool() {
        this.currentPlayer.pooledFields++
        this.events.emit(Focus.ADDED_ITEM_TO_POOL, this.currentPlayer)
    }

    getFieldBasedOnDirectionAndMoveCount(field, direction, howManyFieldWantMove) {
        const offset = this.getOffsetBasedOnDirection(field, direction, howManyFieldWantMove)
        const foundField = this.gameBoard.getFieldAt(field.x + offset.x, field.y + offset.y)

        return foundField
    }

    getOffsetBasedOnDirection(field, direction, howManyFieldWantMove) {
        let mult = howManyFieldWantMove

        if (howManyFieldWantMove < 1)
            mult = 1

        if (field.height < howManyFieldWantMove)
            mult = field.height

        return { x: direction.x * mult, y: direction.y * mult }
    }

    getNextPlayer() {
        if (this.currentPlayer.doesOwnThisField(FIELD_STATE_PLAYER_A))
            return PLAYER_B

        return PLAYER_A
    }

    nextTurn() {
        this.currentPlayer = this.getNextPlayer()
        this.events.emit(Focus.NEXT_TURN)
    }

    checkForVictoryCondition() {
        const player = this.getNextPlayer()
        const countOfEnemyFields = this.gameBoard.countPlayersFields(player)
        const countOfCurrentPlayerFields = this.gameBoard.countPlayersFields(this.currentPlayer)

        if (countOfEnemyFields === 0) {
            this.checkForPoolAvailability(this.currentPlayer, player)
        } else if (countOfCurrentPlayerFields === 0) {
            this.checkForPoolAvailability(player, this.currentPlayer)
        }
    }

    checkForPoolAvailability(playerWhoWon, playerWhoFail) {
        if (playerWhoFail.pooledFields === 0)
            this.events.emit(Focus.VICTORY, playerWhoWon)
        else
            this.events.emit(Focus.ENEMY_HAS_POOL, playerWhoFail)
    }
}