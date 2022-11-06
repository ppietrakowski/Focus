import EventEmmiter from 'eventemitter3'
import { IPlayer, Player } from './Player'

export type Direction = {
    x: number,
    y: number
}

export enum FieldState 
{
    Unplayable = 2 << 0,
    Empty = 2 << 1,
    Red = 2 << 2,
    Green = 2 << 3
}

interface IFieldOvergrownListener 
{
    (field: IField, stateThatWasPoped: FieldState): void
}

/**
* Event name. Event that can happen when field.height > 5
* @delegate IFieldOvergrownListener
*/
export const EventFieldOvergrown = 'FieldOvergrown'

export const DirectionSouth = { x: 0, y: 1 }
export const DirectionNorth = { x: 0, y: -1 }
export const DirectionEast = { x: 1, y: 0 }
export const DirectionWest = { x: -1, y: 0 }

export interface IField 
{
    readonly events: EventEmmiter

    /**
    * Moves from argument field to this field
    * It return false, if is not possible to move to this field
    * @param additionalDistance? move distance, if not specified the distance value is used
    */
    moveToThisField(fromWhichField: IField, additionalDistance?: number): boolean
    placeAtTop(state: FieldState): void

    getDistanceToField(field: IField): number
    getDirectionToField(field: IField): Direction

    possessByPlayer(player: IPlayer): void

    /**
    * Returns a height of this field, should not be greater than 5
    */
    get height(): number
    get state(): FieldState

    get x(): number
    get y(): number

    get isEmpty(): boolean
    get isPlayable(): boolean
}

export function getDirectionFromOffset(x: number, y: number) 
{
    if (x > 0) 
    {
        return DirectionEast
    }
    else if (x < 0) 
    {
        return DirectionWest
    }
    else if (y > 0) 
    {
        return DirectionSouth
    }

    return DirectionNorth
}