import EventEmitter from 'eventemitter3'
import { EventClickField, EventMouseLeaveField, EventMouseOverField, IClickListener, IFieldView } from './FieldView'
import { IField } from './IField'
import { IPlayer } from './Player'


export class FieldViewDecorator implements IFieldView {
    readonly events: EventEmitter
    field: IField
    domElement: HTMLDivElement

    constructor(private readonly decoratedFieldView: IFieldView, private readonly owningPlayer: IPlayer) {
        this.domElement = this.decoratedFieldView.domElement
        this.field = this.decoratedFieldView.field
        this.events = this.decoratedFieldView.events

        this.domElement.addEventListener('mouseover', () => this.onMouseOver())
        this.domElement.addEventListener('mouseleave', () => this.onMouseLeave())
        this.domElement.addEventListener('click', () => this.onClick())
    }

    addClickListener<T>(clickListener: IClickListener, context: T, backup?: boolean): void {
        this.decoratedFieldView.addClickListener(clickListener, context, backup)
    }

    backupClickListeners(): void {
        this.decoratedFieldView.backupClickListeners()
    }

    restoreClickListeners(): void {
        this.decoratedFieldView.restoreClickListeners()
    }


    private onClick(): void {
        this.events.emit(EventClickField, this)
    }

    private onMouseLeave(): void {
        this.events.emit(EventMouseLeaveField, this.owningPlayer, this)
    }

    private onMouseOver(): void {
        this.events.emit(EventMouseOverField, this.owningPlayer, this)
    }

    isInRange(anotherField: IField, range: { x: number; y: number; }): boolean {
        return this.decoratedFieldView.isInRange(anotherField, range)
    }

    visualizeHovered(): void {
        this.decoratedFieldView.visualizeHovered()
    }

    visualizeUnhovered(): void {
        this.decoratedFieldView.visualizeUnhovered()
    }
}