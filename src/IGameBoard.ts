import { Direction, IField } from './IField'
import { IPlayer } from './Player'
import { ForEachCallback } from './GameBoard'

export interface IGameBoard
{
    each(callback: ForEachCallback): void
    getFieldAt(x: number, y: number): IField
    countPlayersFields(player: IPlayer): number
    length(): number

    getBoardAfterMove(fromField: IField, toField: IField): IGameBoard
    getBoardAfterPlace(x: number, y: number, player: IPlayer): IGameBoard
}
