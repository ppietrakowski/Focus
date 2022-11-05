import { Player } from './Player'
import { IField, FieldState, Direction, EventFieldOvergrown, getDirectionFromOffset } from './IField'
import EventEmitter from 'eventemitter3'

export const MaxTowerHeight = 5

export class Field implements IField 
{
    private _state: FieldState
    private _underThisField: FieldState[]
    private _x: number
    private _y: number
    events: EventEmitter

    constructor(state: FieldState, x: number, y: number) 
    {
        this._state = state
        this._underThisField = []
        this._x = x
        this._y = y
        this.events = new EventEmitter()
    }

    moveToThisField(fromWhichField: IField, additionalDistance?: number) 
	{
        if (!fromWhichField.isPlayable || !(fromWhichField instanceof Field)) 
		{
            return false
        }

		additionalDistance = additionalDistance || this.getDistanceToField(fromWhichField)

        if (this.tryToMoveThanAvailable(additionalDistance))
        {
            return false
        }
  
        const oldState = fromWhichField.state

        this._underThisField = this.getNewUnderElements(fromWhichField, additionalDistance)
        this._state = oldState

        this.reduceOverGrown()

        return true
    }

    private reduceOverGrown() 
    {
        while (this._underThisField.length > MaxTowerHeight) 
        {
            const fieldState = this._underThisField.pop()
            this.events.emit(EventFieldOvergrown, this, fieldState)
        }
    }

    private tryToMoveThanAvailable(additionalDistance: number) {
        return additionalDistance > this.height
    }

    private getNewUnderElements(fromWhichField: Field, distance: number) 
    {
        const shiftedElements = fromWhichField.shiftElements(distance - 1)

        if (fromWhichField.isEmpty) 
        {
            return shiftedElements
        }

        return shiftedElements.concat([this._state], this._underThisField)
    }

    private shiftElements(n: number) 
    {
        const firstElements : FieldState[] = []

        while (n-- > 0) 
        {
            const element = this._underThisField.shift() || null

            if (element) 
            {
                firstElements.push(element)
            }
        }

        // update the this.state to next element under
        this._state = this._underThisField.shift() || FieldState.Empty

        return firstElements
    }

    placeAtTop(state: FieldState): void {
        this._underThisField = [this._state].concat(this._underThisField)
        this._state = state

        this.reduceOverGrown()
    }

    getDistanceToField(anotherField: Field) 
    {
        const v = { x: anotherField.x - this.x, y: anotherField.y - this.y }

        if (Math.abs(v.x) > 0) 
        {
            return Math.abs(v.x)
        }

        return Math.abs(v.y)
    }

    getDirectionToField(anotherField: IField): Direction 
    {
        const v = { x: anotherField.x - this.x, y: anotherField.y - this.y }

        if (!this.canJump(v)) 
        {
            return null
        }

        return getDirectionFromOffset(v.x, v.y)
    }

    private canJump(v: {x: number, y: number}) 
    {
        return Math.abs(v.x) <= this.height && Math.abs(v.y) <= this.height
    }

    possessByPlayer(player: Player): void 
    {
        this._state = player.state
    }

    get state(): FieldState 
    {
        return this._state
    }

    get x(): number 
    {
        return this._x
    }

    get y(): number 
    {
        return this._y
    }

    get height() {
        return this._underThisField.length + 1
    }

    get isOvergrown() {
        return this.height >= MaxTowerHeight
    }
    
    get isEmpty() {
        return !!(this._state & FieldState.Empty)
    }
    
    get isPlayable() {
        return !(this._state & FieldState.Unplayable)
    }
}