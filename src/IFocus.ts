import EventEmitter from 'eventemitter3'
import { Direction, IField } from './IField'
import { IGameBoard } from './IGameBoard'
import { IPlayer } from './Player'


export interface IVictoryListener {
    onVictory(victoriousPlayer: IPlayer): void
}

export interface IMovedListener {
    onMoveField(fromX: number, fromY: number, from: IField, to: IField): void
}

export interface IAddedToPoolListener {
    onAddedToPool(toWhichPlayer: IPlayer): void
}

export interface IEnemyHasPoolListener {
    onEnemyHasPool(enemy: IPlayer): void
}

export interface INewTurnListener {
    onNextTurnBegin(currentPlayer: IPlayer): void
}

export interface Move {
    direction?: Direction,
    moveCount?: number

    /** contains baseX of moving field or placing x */
    x: number

    /** contains baseY of moving field or placing y */
    y: number

    shouldPlaceSomething?: boolean

    /** red reserve count */
    redPawns?: number

    /** green reserve count */
    greenPawns?: number
}

export const EventVictory = 'Victory'
export const EventMovedField = 'MovedField'
export const EventAddedToPool = 'AddedToPool'
export const EventEnemyHasPool = 'EnemyHasPool'
export const EventNewTurn = 'NewTurn'

export interface IFocus {
    readonly events: EventEmitter
    readonly gameBoard: IGameBoard

    moveToField(x: number, y: number, direction: Direction, howManyFieldWantMove: number): boolean
    placeField(x: number, y: number, owner: IPlayer): void
    getOffsetBasedOnDirection(field: IField, direction: { x: number; y: number; }, howManyFieldWantMove: number): { x: number; y: number; }
    getNextPlayer(player?: IPlayer): IPlayer
    nextTurn(): void

    get currentPlayer(): IPlayer
    set currentPlayer(player: IPlayer)
    get hasEnded(): boolean

    setHasPoolToPut(): void

    mustEnd: boolean
}
