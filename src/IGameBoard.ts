import { Direction, IField } from './IField'
import { IPlayer } from './Player'
import { ForEachCallback } from './GameBoard'

export interface AfterPlaceMove
{
    gameBoard: IGameBoard
    redCount: number
    greenCount: number
}

export interface IGameBoard
{
    each(callback: ForEachCallback): void
    getFieldAt(x: number, y: number): IField
    countPlayersFields(player: IPlayer): number
    length(): number

    getBoardAfterMove(fromField: IField, toField: IField, player: IPlayer): AfterPlaceMove
    getBoardAfterPlace(x: number, y: number, player: IPlayer): AfterPlaceMove
}
