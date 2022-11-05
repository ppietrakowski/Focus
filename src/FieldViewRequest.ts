import { FieldView, IClickListener, IFieldView, IMouseStateListener } from "./FieldView";
import { IField } from "./IField";
import { IPlayer } from "./Player";

export class FieldViewRequest implements IFieldView
{

    constructor(private readonly fieldView: IFieldView, private readonly owningPlayer: IPlayer)
    {
        this.domElement = this.fieldView.domElement
        this.field = this.fieldView.field

        this.domElement.addEventListener('mouseover', () => this.onMouseOver())
        this.domElement.addEventListener('mouseleave', () => this.onMouseLeave())
        this.domElement.addEventListener('click', () => this.onClick())
    }

    addMouseStateListener(listener: IMouseStateListener)
    {
        this.fieldView.addMouseStateListener(listener)
    }

    addClickListener(listener: IClickListener): void
    {
        this.fieldView.addClickListener(listener)
    }

    backupClickListeners(): void
    {
        this.fieldView.backupClickListeners()
    }

    restoreClickListeners(): void
    {
        this.fieldView.restoreClickListeners()
    }

    private onClick(): void
    {
        if (this.fieldView instanceof FieldView)
        {
            this.fieldView.onClick()
        }
    }

    private onMouseLeave(): void
    {
        if (this.fieldView instanceof FieldView)
        {
            this.fieldView.onMouseLeave()
        }
    }

    private onMouseOver(): void
    {
        if (this.fieldView instanceof FieldView)
        {
            this.fieldView.onMouseOver()
        }
    }

    field: IField
    domElement: HTMLDivElement

    isInRange(anotherField: IField, range: { x: number; y: number; }): boolean
    {
        return this.fieldView.isInRange(anotherField, range)
    }

    visualizeHovered(): void
    {
        this.fieldView.visualizeHovered()
    }

    visualizeUnhovered(): void
    {
        this.fieldView.visualizeUnhovered()
    }
}