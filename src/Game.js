import { FIELD_STATE_PLAYER_A, FIELD_STATE_PLAYER_B, FIELD_STATE_UNPLAYABLE } from "./Field";
import { GameBoard } from "./GameBoard";
import { Player } from "./Player";

const PLAYER_A = new Player(FIELD_STATE_PLAYER_A)
const PLAYER_B = new Player(FIELD_STATE_PLAYER_B)

export class Focus {
    constructor() {
        this.gameBoard = new GameBoard()
        this.events = this.gameBoard.events
        this.currentPlayer = PLAYER_A
    }

    moveToField(x, y, direction) {
        const field = this.gameBoard.getFieldAt(x, y)

        if (!this.currentPlayer.doesOwnThisField(field))
            return false


        const fieldToJump = this.getFieldToJump(field, direction, x, y)

        if (this.isOutOfBounds(fieldToJump))
            return false

        if (fieldToJump.isOvergrown()) {
            this.detectedOvergrowthElement(field, fieldToJump)
        }

        fieldToJump.makeAsNextField(field)
        fieldToJump.state = this.currentPlayer.state
        
        return true
    }

    getNextPlayer() {
        if (this.currentPlayer.state & FIELD_STATE_PLAYER_A)
            return PLAYER_B

        return PLAYER_A
    }

    getOffsetBasedOnFieldHeight(field, direction) {
        return { x: direction.x * field.height, y: direction.y * field.height }
    }

    isOutOfBounds(field) {
        return !field || !!(field.state & FIELD_STATE_UNPLAYABLE)
    }

    getFieldToJump(field, direction, x, y) {
        const offset = this.getOffsetBasedOnFieldHeight(field, direction)
        const fieldToJump = this.gameBoard.getFieldAt(x + offset.x, y + offset.y)

        return fieldToJump
    }

    detectedOvergrowthElement(field, fieldToJump) {
        field.height = GameBoard.MAX_TOWER_HEIGHT - 1

        // check is the hit on our field
        if (fieldToJump.state & this.currentPlayer.state) {
            this.jumpedOnOurField()
        }
    }

    jumpedOnOurField() {
        this.currentPlayer.pooledFields++
        this.events.emit('newFieldInPool', this.currentPlayer)
    }

    nextTurn() {
        this.currentPlayer = this.getNextPlayer()
        this.events.emit('nextTurn')
    }
}