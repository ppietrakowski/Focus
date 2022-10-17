import { FIELD_STATE_EMPTY, FIELD_STATE_PLAYER_A, FIELD_STATE_PLAYER_B, FIELD_STATE_UNPLAYABLE, MAX_TOWER_HEIGHT } from "./Field";
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
        this._gameBoard = new GameBoard()
        this.events = this._gameBoard.events
        this._currentPlayer = PLAYER_A

        this.events.on(Focus.MOVED_FIELD, this.checkForVictoryCondition, this)
    }

    moveToField(x, y, direction, howManyFieldWantMove) {
        let from = this._gameBoard.getFieldAt(x, y)

        if (!from.belongsTo(this._currentPlayer))
            return false

        let toField = this.getFieldBasedOnDirectionAndMoveCount(from, direction, howManyFieldWantMove)
        toField.makeAsNextField(from, howManyFieldWantMove)

        if (toField.isOvergrown)
            this.popElementsToCreateTower(toField)

        this.events.emit(Focus.MOVED_FIELD, x, y, toField, from)
        return true
    }

    popElementsToCreateTower(toField) {
        while (toField.height > MAX_TOWER_HEIGHT)
            this.popTopElementFromField(toField)
    }

    popTopElementFromField(toField) {
        const field = toField._top.pop()

        if (this._currentPlayer.doesOwnThisField(field))
            this.increaseCurrentPlayersPool()
    }

    increaseCurrentPlayersPool() {
        this._currentPlayer.pooledFields++;
        this.events.emit(Focus.ADDED_ITEM_TO_POOL, this._currentPlayer);
    }

    getFieldBasedOnDirectionAndMoveCount(field, direction, howManyFieldWantMove) {
        const offset = this.getOffsetBasedOnDirection(field, direction, howManyFieldWantMove)
        const foundField = this._gameBoard.getFieldAt(field.x + offset.x, field.y + offset.y)
        
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
        if (this._currentPlayer.doesOwnThisField(FIELD_STATE_PLAYER_A))
            return PLAYER_B

        return PLAYER_A
    }

    nextTurn() {
        this._currentPlayer = this.getNextPlayer()
        this.events.emit(Focus.NEXT_TURN)
    }

    checkForVictoryCondition() {
        const nextPlayer = this.getNextPlayer()
        const countOfEnemyFields = this._gameBoard.countPlayersFields(nextPlayer)

        if (countOfEnemyFields === 0)
            this.checkForPoolAvailability(nextPlayer)
    }

    checkForPoolAvailability(player) {
        if (player.pooledFields > 0)
            this.events.emit(Focus.VICTORY, this._currentPlayer)
        else
            this.events.emit(Focus.ENEMY_HAS_POOL, player)
    }
}