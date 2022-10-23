import { EventEmitter } from "eventemitter3"
import { DIRECTION_EAST, DIRECTION_NORTH, DIRECTION_SOUTH, DIRECTION_WEST, Field, FIELD_STATE_PLAYER_A, FIELD_STATE_PLAYER_B } from "./Field"
import { Focus } from "./Game"

export class FieldView {

    static FIELD_UNCLICK = 'UnClick'
    static FIELD_CLICK = 'Click'

    /**
     * 
     * @param {Focus} game
     * @param {Field} field 
     * @param {*} rootElement 
     */
    constructor(game, field) {

        this.field = field
        this.isSelected = false
        this.game = game

        this.events = new EventEmitter()

        this.domElement = document.createElement('div')

        this.domElement.className = this.getUnhoveredClassName()

        this.domElement.addEventListener('mouseover', e => this.onMouseOver())
        this.domElement.addEventListener('mouseleave', e => this.onMouseLeave())
        this.domElement.addEventListener('click', () => this.onClick())
    }

    onMouseLeave() {
        if (this.game.currentPlayer.doesOwnThisField(this.field) && !this.isSelected)
            this.domElement.className = this.getUnhoveredClassName()
    }

    getHoveredClassName() {
        return (this.field.state & FIELD_STATE_PLAYER_A) ? 'playerRedFieldHovered' : (this.field.state & FIELD_STATE_PLAYER_B) ? 'playerGreenFieldHovered' : 'emptyField'
    }

    getUnhoveredClassName() {
        return (this.field.state & FIELD_STATE_PLAYER_A) ? 'playerRedField' : (this.field.state & FIELD_STATE_PLAYER_B) ? 'playerGreenField' : 'emptyField'
    }

    onMouseOver() {
        if (this.game.currentPlayer.doesOwnThisField(this.field) && !this.isSelected) {
            this.domElement.className = this.getHoveredClassName()
        }
    }

    onClick() {
        this.events.emit(FieldView.FIELD_CLICK, this.field)
    }

    /**
     * 
     * @param {FieldView} anotherField 
     */
    isInRange(anotherField, range) {
        return (anotherField.x - range.x >= this.field.x && anotherField.x + range.x <= this.field.x) && 
                (anotherField.y - range.y >= this.field.y && anotherField.y + range.y <= this.field.y)
    }
}