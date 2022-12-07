import { FieldState, IField } from './IField'
import { IPlayer } from './Player'
import { ForEachCallback } from './GameBoard'
import { IPredicate } from './GameUtils'

export interface AfterPlaceMove {
    gameBoard: IGameBoard
    redCount: number
    greenCount: number
}

export interface IGameBoard {
    redPlayerPawnCount: number
    greenPlayerPawnCount: number

    each(callback: ForEachCallback): void
    filter(predicate: IPredicate<IField>): IField[]
    getFieldAt(x: number, y: number): IField
    countPlayersFields(player: IPlayer): number
    length(): number

    getBoardAfterMove(fromField: IField, toField: IField, player: IPlayer): IGameBoard
    getBoardAfterPlace(x: number, y: number, player: IPlayer): AfterPlaceMove
}