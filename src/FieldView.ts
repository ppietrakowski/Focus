import EventEmitter from 'eventemitter3'
import { Direction, FieldState, IField } from './IField'
import { IFocus } from './IFocus'
import { IPlayer } from './Player'

export interface IClickListener {
    (fieldView: IFieldView): void
}

export interface IMouseStateListener {
    (player: IPlayer, fieldView: IFieldView): void
}

export const EventClickField = 'EventClickField'
export const EventMouseOverField = 'EventOverField'
export const EventMouseLeaveField = 'EventMouseLeaveField'

export interface IFieldView {
    isInRange(anotherField: IField, range: { x: number, y: number }): boolean
    visualizeHovered(): void
    visualizeUnhovered(): void

    addClickListener<T>(clickListener: IClickListener, context: T, backup?: boolean): void

    backupClickListeners(): void
    restoreClickListeners(): void

    readonly events: EventEmitter
    field: IField
    domElement: HTMLDivElement
}

interface IClickListenerBackup {
    listener: IClickListener
    context: unknown
}

export class FieldView implements IFieldView {
    field: IField
    readonly events: EventEmitter
    domElement: HTMLDivElement

    private _backupClickListeners: IClickListenerBackup[]

    constructor(private readonly game: IFocus, field: IField) {
        this.field = field
        this.events = new EventEmitter()
        this.domElement = document.createElement('div')

        this.domElement.className = this.getUnhoveredClassName()
        this._backupClickListeners = []
    }

    addClickListener<T>(clickListener: IClickListener, context: T, backup?: boolean): void {
        this.events.on(EventClickField, clickListener, context)

        if (backup) {
            this._backupClickListeners.push({ listener: clickListener, context: context })
        }
    }

    backupClickListeners(): void {
        this.events.removeAllListeners(EventClickField)
    }

    restoreClickListeners(): void {
        this.events.removeAllListeners(EventClickField)

        for (const listener of this._backupClickListeners) {
            this.events.on(EventClickField, listener.listener, listener.context)
        }

        console.log(`field at (${this.field.x}, ${this.field.y}) restored listeners`)
    }

    visualizeHovered() {
        this.domElement.className = this.getHoveredClassName()
        console.log(this.field.towerStructure)
    }

    visualizeUnhovered() {
        this.domElement.className = this.getUnhoveredClassName()
    }

    isInRange(anotherField: IField, range: Direction) {
        return (anotherField.x - range.x >= this.field.x && anotherField.x + range.x <= this.field.x) &&
            (anotherField.y - range.y >= this.field.y && anotherField.y + range.y <= this.field.y)
    }

    private getHoveredClassName() {
        return (this.field.state & FieldState.Red) ? 'playerRedFieldHovered' : (this.field.state & FieldState.Green) ? 'playerGreenFieldHovered' : 'emptyField'
    }

    private getUnhoveredClassName() {
        return (this.field.state & FieldState.Red) ? 'playerRedField' : (this.field.state & FieldState.Green) ? 'playerGreenField' : 'emptyField'
    }
}