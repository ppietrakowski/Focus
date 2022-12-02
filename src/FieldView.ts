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

interface IVisualizeFunction {
    (state: number): string
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
    private tower: number[]
    private rootNodeChilds: HTMLDivElement[]

    constructor(private readonly game: IFocus, field: IField) {
        this.field = field
        this.events = new EventEmitter()

        this.domElement = document.createElement('div')
        this.domElement.className = 'rootObject'
        this.rootNodeChilds = []

        const createSubNodeToRootNode = () => {
            const htmlElement = document.createElement('div') as HTMLDivElement
            htmlElement.className = 'emptyField'
            this.domElement.appendChild(htmlElement)
            this.rootNodeChilds.push(htmlElement)
        }

        for (let i = 0; i < 5; i++) {
            createSubNodeToRootNode()
        }

        this.domElement.children[0].className = this.getUnhoveredClassName(field.state)

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
    }

    visualizeHovered() {
        this.updateEachChild(this.getHoveredClassName)
    }

    visualizeUnhovered() {
        this.updateEachChild(this.getUnhoveredClassName)
    }

    private updateEachChild(fn: IVisualizeFunction) {
        let scale = 1.0
        this.tower = this.field.towerStructure

        this.clearEachChild(fn)

        scale = 1.0 - (this.tower.length - 1) * 0.1

        for (let i = 0; i < this.tower.length; i++) {
            scale = this.updateChildDisplay(i, fn, scale)
        }
    }

    private updateChildDisplay(i: number, fn: IVisualizeFunction, scale: number) {
        const child = this.rootNodeChilds[i]

        child.className = fn(this.tower[i])
        child.style.scale = scale.toString()
        child.style.zIndex = (5 - i).toString()
        scale += 0.1

        return scale
    }

    private clearEachChild(fn: IVisualizeFunction) {
        for (let i = 0; i < this.rootNodeChilds.length; i++) {
            const child = this.rootNodeChilds[i]
            child.className = fn(FieldState.Empty)
            child.style.scale = '1'
        }
    }

    isInRange(anotherField: IField, range: Direction) {
        return (anotherField.x - range.x >= this.field.x && anotherField.x + range.x <= this.field.x) &&
            (anotherField.y - range.y >= this.field.y && anotherField.y + range.y <= this.field.y)
    }

    private getHoveredClassName(state: number) {
        return (state & FieldState.Red) ? 'playerRedFieldHovered' : (state & FieldState.Green) ? 'playerGreenFieldHovered' : 'emptyField'
    }

    private getUnhoveredClassName(state: number) {
        return (state & FieldState.Red) ? 'playerRedField' : (state & FieldState.Green) ? 'playerGreenField' : 'emptyField'
    }
}