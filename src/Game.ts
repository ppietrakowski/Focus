import { Field, FIELD_EVENTS } from './Field'
import { GameBoard } from './GameBoard'
import { EventAddedToPool, EventEnemyHasPool, EventMovedField, EventNewTurn, EventVictory, IFocus } from './IFocus'
import { EventFieldOvergrown, FieldState, IField } from './IField'

import { IGameBoard } from './IGameBoard'
import { IPlayer, Player } from './Player'
import EventEmitter from 'eventemitter3'

import board from './board.json'

export const PLAYER_RED = new Player(FieldState.Red)
export const PLAYER_GREEN = new Player(FieldState.Green)

export class Focus implements IFocus
{
    readonly events: EventEmitter
    readonly gameBoard: IGameBoard

    private _hasPoolToPut: boolean
    private _currentPlayer: IPlayer
    private _hasEnded = false

    constructor()
    {
        this.events = new EventEmitter()
        this.gameBoard = GameBoard.loadFromJSON(board)

        this._currentPlayer = PLAYER_RED
        this._hasPoolToPut = false

        this.events.on(EventMovedField, this.onMoveField, this)

        this.gameBoard.each(v => {
            const f = v as Field
            f.overgrownCallback = (f, p) => this.onOverGrownField(f, p)
            console.log(f.overgrownCallback)
        })

    }

    private onOverGrownField(field: IField, stateThatWasPoped: FieldState): void
    {
        if (this.currentPlayer.doesOwnThisField(stateThatWasPoped))
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
            console.warn('unable to move there')
            return false
        }

        this.events.emit(EventMovedField, x, y, fromField, toField)

        this.nextTurn()
        return true
    }

    placeField(x: number, y: number, owner: IPlayer)
    {
        const field = this.gameBoard.getFieldAt(x, y)

        field.placeAtTop(owner.state)
        if (owner instanceof Player)
        {
            if (owner === PLAYER_GREEN)
                this.gameBoard.greenPlayerPawnCount--
            else
                this.gameBoard.redPlayerPawnCount--
        }

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
        if (this._hasPoolToPut)
        {
            this._currentPlayer = this.getNextPlayer()
            this._hasPoolToPut = false
            return
        }

        if (this.hasEnded)
            return


        this._currentPlayer = this.getNextPlayer()
        this.events.emit(EventNewTurn, this._currentPlayer)
    }

    setHasPoolToPut(): void
    {
        this._hasPoolToPut = true
    }

    private increaseCurrentPlayersPool()
    {
        if (this._currentPlayer instanceof Player && PLAYER_GREEN === this._currentPlayer)
            this.gameBoard.greenPlayerPawnCount++
        else if (this._currentPlayer instanceof Player && PLAYER_RED === this._currentPlayer)
            this.gameBoard.redPlayerPawnCount++
    }

    get hasEnded(): boolean
    {
        return this._hasEnded
    }


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