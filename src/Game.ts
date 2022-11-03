import EventEmitter from 'eventemitter3'
import { FIELD_STATE_PLAYER_RED, FIELD_STATE_PLAYER_GREEN, MAX_TOWER_HEIGHT, Field, IField } from './Field'
import { GameBoard, IGameBoard } from './GameBoard'
import { IPlayer, Player } from './Player'

export const PLAYER_RED = new Player(FIELD_STATE_PLAYER_RED)
export const PLAYER_GREEN = new Player(FIELD_STATE_PLAYER_GREEN)

export interface IFocus {
    events: EventEmitter
    gameBoard: IGameBoard

    moveToField(x: number, y: number, direction: {x: number, y: number}, howManyFieldWantMove: number): boolean
    placeField(x: number, y: number, owner: IPlayer): void
    getOffsetBasedOnDirection(field: IField, direction: {x: number, y: number}, howManyFieldWantMove: number): {x: number, y: number}
    getNextPlayer(player?: IPlayer): IPlayer
    nextTurn(): void

    get currentPlayer(): IPlayer
}

export class Focus implements IFocus {
    static readonly ADDED_ITEM_TO_POOL = 'addedItemToPool'
    static readonly MOVED_FIELD = 'movedField'
    static readonly VICTORY = 'victory'
    static readonly ENEMY_HAS_POOL = 'enemyHasPool'
    static readonly NEXT_TURN = 'nextTurn'

    gameBoard: IGameBoard
    events: EventEmitter
    private _currentPlayer: IPlayer

    constructor() {
        this.gameBoard = new GameBoard()
        this.events = this.gameBoard.events
        this._currentPlayer = PLAYER_RED
    
        this.events.on(Focus.MOVED_FIELD, this.checkForVictoryCondition, this)
    }
    

    moveToField(x: number, y: number, direction: {x: number, y: number}, howManyFieldWantMove: number) {
        const fromField = this.gameBoard.getFieldAt(x, y)

        if (!fromField.belongsTo(this._currentPlayer)) {
            return false
        }

        const toField = this.getFieldBasedOnDirectionAndMoveCount(fromField, direction, howManyFieldWantMove)

        if (!toField.isPlayable) {
            return false
        }

        toField.makeAsNextField(fromField, howManyFieldWantMove)

        if (toField.isOvergrown) {
            this.popElementsToCreateTower(toField)
        }

        this.events.emit(Focus.MOVED_FIELD, x, y, toField, fromField)
        return true
    }
    
    placeField(x: number, y: number, owner: IPlayer) {
        const field = this.gameBoard.getFieldAt(x, y)

        field.underThisField = this.makeNewUnderAfterPlacing(field)
        owner.possessField(field)

        if (field.isOvergrown) {
            this.popElementsToCreateTower(field)
        }
    }

    getOffsetBasedOnDirection(field: IField, direction: {x: number, y: number}, howManyFieldWantMove: number) {
        let mult = howManyFieldWantMove

        if (howManyFieldWantMove < 1) {
            mult = 1
        }

        if (field.height < howManyFieldWantMove) {
            mult = field.height
        }

        return { x: direction.x * mult, y: direction.y * mult }
    }
    
    getNextPlayer(toPlayer?: IPlayer) {
        if (!toPlayer) {
            toPlayer = this.currentPlayer
        }

        if (toPlayer.doesOwnThisField(FIELD_STATE_PLAYER_RED)) {
            return PLAYER_GREEN
        }

        return PLAYER_RED
    }

    nextTurn() {
        this._currentPlayer = this.getNextPlayer()
        this.events.emit(Focus.NEXT_TURN)
    }

    get currentPlayer(): IPlayer {
        return this._currentPlayer
    }

    private makeNewUnderAfterPlacing(field: IField) {
        let newUnderElements = field.underThisField

        if (!field.isEmpty) {
            newUnderElements = [{ state: field.state }].concat(newUnderElements)
        }

        return newUnderElements
    }

    private popElementsToCreateTower(toField: IField) {
        while (toField.height > MAX_TOWER_HEIGHT)
            this.popTopElementFromField(toField)
    }

    private popTopElementFromField(toField: IField) {
        const field = toField.underThisField.pop()

        if (this.currentPlayer.doesOwnThisField(field.state)) {
            this.increaseCurrentPlayersPool()
        }
    }

    private increaseCurrentPlayersPool() {
        this.currentPlayer.pooledPawns++
        this.events.emit(Focus.ADDED_ITEM_TO_POOL, this.currentPlayer)
    }

    private getFieldBasedOnDirectionAndMoveCount(field: IField, direction: {x: number, y: number}, howManyFieldWantMove: number) {
        const offset = this.getOffsetBasedOnDirection(field, direction, howManyFieldWantMove)
        const foundField = this.gameBoard.getFieldAt(field.x + offset.x, field.y + offset.y)

        return foundField
    }

    private checkForVictoryCondition() {
        const player = this.getNextPlayer()
        const countOfEnemyFields = this.gameBoard.countPlayersFields(player)
        const countOfCurrentPlayerFields = this.gameBoard.countPlayersFields(this.currentPlayer)

        if (countOfEnemyFields === 0) {
            this.checkForPoolAvailability(this.currentPlayer, player)
        } else if (countOfCurrentPlayerFields === 0) {
            this.checkForPoolAvailability(player, this.currentPlayer)
        }
    }

    private checkForPoolAvailability(playerWhoWon: IPlayer, playerWhoFail: IPlayer) {
        if (playerWhoFail.pooledPawns !== 0) {
            this.events.emit(Focus.ENEMY_HAS_POOL, playerWhoFail)
            return
        }
        
        // no pawns = Victory
        this.events.emit(Focus.VICTORY, playerWhoWon)
    }
}