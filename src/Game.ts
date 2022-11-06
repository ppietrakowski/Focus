import { Field } from './Field'
import { GameBoard } from './GameBoard'
import { EventAddedToPool, EventEnemyHasPool, EventMovedField, EventNewTurn, EventVictory, IFocus } from './IFocus'
import { EventFieldOvergrown, FieldState, IField } from './IField'

import { IGameBoard } from './IGameBoard'
import { IPlayer, Player } from './Player'
import EventEmitter from 'eventemitter3'

export const PLAYER_RED = new Player(FieldState.Red)
export const PLAYER_GREEN = new Player(FieldState.Green)

export class Focus implements IFocus
{
    events: EventEmitter
    gameBoard: IGameBoard
    private _currentPlayer: IPlayer
    hasPoolToPut: boolean

    constructor()
    {
        this.events = new EventEmitter()
        this.gameBoard = new GameBoard()
        this._currentPlayer = PLAYER_RED
        this.hasPoolToPut = false

        this.events.on(EventMovedField, this.onMoveField, this)

        PLAYER_GREEN.pooledPawns++

        this.gameBoard.each(v => v.events.on(EventFieldOvergrown, this.onOverGrownField, this))
    }

    private onOverGrownField(field: IField, stateThatWasPoped: FieldState): void
    {
        if (stateThatWasPoped === this.currentPlayer.state)
            this.increaseCurrentPlayersPool()
    }

    private onMoveField(): void
    {
        const player = this.getNextPlayer()

        const countOfEnemyFields = this.gameBoard.countPlayersFields(player)
        const countOfCurrentPlayerFields = this.gameBoard.countPlayersFields(this.currentPlayer)

        if (countOfEnemyFields === 0)
        {
            this.checkForPoolAvailability(this.currentPlayer, player)
        } else if (countOfCurrentPlayerFields === 0)
        {
            this.checkForPoolAvailability(player, this.currentPlayer)
        }
    }

    get currentPlayer(): IPlayer
    {
        return this._currentPlayer
    }

    set currentPlayer(player: IPlayer)
    {
        this._currentPlayer = player
    }

    moveToField(x: number, y: number, direction: { x: number, y: number }, howManyFieldWantMove: number)
    {
        const fromField = this.gameBoard.getFieldAt(x, y)

        if (!this._currentPlayer.doesOwnThisField(fromField))
        {
            return false
        }

        const toField = this.getFieldBasedOnDirectionAndMoveCount(fromField as Field, direction, howManyFieldWantMove)
        if (!toField.isPlayable)
        {
            return false
        }

        if (!toField.moveToThisField(fromField, howManyFieldWantMove))
        {
            console.log('unable to move there')
            return false
        }

        console.log(toField)
        this.events.emit(EventMovedField, x, y, fromField, toField)

        this.nextTurn()
        return true
    }

    placeField(x: number, y: number, owner: IPlayer)
    {
        const field = this.gameBoard.getFieldAt(x, y)

        field.placeAtTop(owner.state)
        owner.pooledPawns--

        // placing is just one move
        this.nextTurn()
    }

    getFieldBasedOnDirectionAndMoveCount(field: Field, direction: { x: number, y: number }, howManyFieldWantMove: number)
    {
        const offset = this.getOffsetBasedOnDirection(field, direction, howManyFieldWantMove)
        const foundField = this.gameBoard.getFieldAt(field.x + offset.x, field.y + offset.y)

        return foundField
    }

    getOffsetBasedOnDirection(field: IField, direction: { x: number, y: number }, howManyFieldWantMove: number)
    {
        let mult = howManyFieldWantMove

        if (howManyFieldWantMove < 1)
        {
            mult = 1
        }

        if (field.height < howManyFieldWantMove)
        {
            mult = field.height
        }

        return { x: direction.x * mult, y: direction.y * mult }
    }

    getNextPlayer(toPlayer?: IPlayer)
    {
        if (!toPlayer)
        {
            toPlayer = this.currentPlayer
        }

        if (toPlayer.doesOwnThisField(FieldState.Red))
        {
            return PLAYER_GREEN
        }

        return PLAYER_RED
    }

    nextTurn()
    {
        if (this.hasPoolToPut)
        {    
            this._currentPlayer = this.getNextPlayer()
            this.hasPoolToPut = false
            return
        }

        if (this.hasEnded)
            return

        
        this._currentPlayer = this.getNextPlayer()
        this.events.emit(EventNewTurn, this._currentPlayer)
    }

    private increaseCurrentPlayersPool()
    {
        this.currentPlayer.pooledPawns++
        this.events.emit(EventAddedToPool, this._currentPlayer)
    }

    get hasEnded(): boolean
    {
        return this._hasEnded
    }
    private _hasEnded = false

    private checkForPoolAvailability(playerWhoWon: IPlayer, playerWhoFail: IPlayer)
    {
        if (playerWhoFail.pooledPawns !== 0)
        {
            this.events.emit(EventEnemyHasPool, playerWhoFail)
            return
        }

        this._hasEnded = true
        // no pawns = Victory
        this.events.emit(EventVictory, playerWhoWon)
    }
}