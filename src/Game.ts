import { Field } from './Field'
import { GameBoard } from './GameBoard'
import { IAddedToPoolListener, IEnemyHasPoolListener, IFocus, IMovedListener, INewTurnListener, IVictoryListener } from './IFocus'
import { EventFieldOvergrown, FieldState, IField } from './IField'

import { IGameBoard } from "./IGameBoard"
import { IPlayer, Player } from './Player'

export const PLAYER_RED = new Player(FieldState.Red)
export const PLAYER_GREEN = new Player(FieldState.Green)

export class Focus implements IFocus, IMovedListener
{
    static readonly ADDED_ITEM_TO_POOL = 'addedItemToPool'
    static readonly MOVED_FIELD = 'movedField'
    static readonly VICTORY = 'victory'
    static readonly ENEMY_HAS_POOL = 'enemyHasPool'
    static readonly NEXT_TURN = 'nextTurn'

    gameBoard: IGameBoard
    private _currentPlayer: IPlayer

    private _victoryListeners: IVictoryListener[]
    private _movedListeners: IMovedListener[]
    private _addedToPoolListeners: IAddedToPoolListener[]
    private _enemyHasPoolListeners: IEnemyHasPoolListener[]
    private _newTurnListeners: INewTurnListener[]

    constructor()
    {
        this.gameBoard = new GameBoard()
        this._currentPlayer = PLAYER_RED

        this._victoryListeners = []
        this._movedListeners = []
        this._addedToPoolListeners = []
        this._enemyHasPoolListeners = []
        this._newTurnListeners = []

        this.addMovedListener(this)

        this.gameBoard.each(v => v.events.on(EventFieldOvergrown, this.increaseCurrentPlayersPool, this))
    }

    onOverGrownField(field: IField, stateThatWasPoped: FieldState): void
    {
        this.increaseCurrentPlayersPool()
    }

    onMoveField(): void
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

    addVictoryListener(listener: IVictoryListener): void
    {
        this._victoryListeners.push(listener)
    }

    removeVictoryListener(listener: IVictoryListener): void
    {
        this._victoryListeners = this._victoryListeners.filter(l => l !== listener)
    }

    addMovedListener(listener: IMovedListener): void
    {
        this._movedListeners.push(listener)
    }

    removeMovedListener(listener: IMovedListener): void
    {
        this._movedListeners = this._movedListeners.filter(l => l !== listener)
    }

    addAddedToPoolListener(listener: IAddedToPoolListener): void
    {
        this._addedToPoolListeners.push(listener)
    }

    removeAddedToPoolListener(listener: IAddedToPoolListener): void
    {
        this._addedToPoolListeners = this._addedToPoolListeners.filter(l => l !== listener)
    }

    addEnemyHasPoolListener(listener: IEnemyHasPoolListener): void
    {
        this._enemyHasPoolListeners.push(listener)
    }

    removeEnemyHasPoolListener(listener: IEnemyHasPoolListener): void
    {
        this._enemyHasPoolListeners = this._enemyHasPoolListeners.filter(l => l !== listener)
    }

    addNewTurnListener(listener: INewTurnListener): void
    {
        this._newTurnListeners.push(listener)
    }

    removeNewTurnListener(listener: INewTurnListener): void
    {
        this._newTurnListeners = this._newTurnListeners.filter(l => l !== listener)
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

        if (!toField.moveToThisField(fromField))
        {
            console.log('unable to move there')
            return false
        }

        this._movedListeners.forEach(l => l.onMoveField(x, y, fromField, toField))

        this.nextTurn()
        return true
    }

    placeField(x: number, y: number, owner: IPlayer)
    {

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
        this._currentPlayer = this.getNextPlayer()
        this._newTurnListeners.forEach(l => l.onNextTurnBegin(this._currentPlayer))
    }

    get currentPlayer(): IPlayer
    {
        return this._currentPlayer
    }

    private increaseCurrentPlayersPool()
    {
        this.currentPlayer.pooledPawns++
        this._addedToPoolListeners.forEach(l => l.onAddedToPool(this.currentPlayer))
    }

    private checkForPoolAvailability(playerWhoWon: IPlayer, playerWhoFail: IPlayer)
    {
        if (playerWhoFail.pooledPawns !== 0)
        {
            debugger;
            this._enemyHasPoolListeners.forEach(l => l.onEnemyHasPool(playerWhoFail))
            return
        }

        // no pawns = Victory
        this._victoryListeners.forEach(l => l.onVictory(playerWhoWon))
    }
}