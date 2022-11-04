import { FieldState } from "./FieldState"
import { IPlayer } from "./Player"

export interface UnderFieldState {
    state: number
}

export const DIRECTION_SOUTH = { x: 0, y: 1 }
export const DIRECTION_NORTH = { x: 0, y: -1 }
export const DIRECTION_EAST = { x: 1, y: 0 }
export const DIRECTION_WEST = { x: -1, y: 0 }

export type Direction = {x: number, y: number}

export interface IField {
    state: FieldState
    underThisField: UnderFieldState[]

    x: number
    y: number

    makeAsNextField(cameFrom: IField, moveCount: number): void

    get height(): number
    get isOvergrown(): boolean
    get isEmpty(): boolean
    get isPlayable(): boolean

    belongsTo(player: IPlayer): boolean
    calculateDirectionTowards(anotherField: IField): Direction
    calculateMoveCountTowards(anotherField: IField): number
}