
export const FIELD_STATE_UNPLAYABLE = 0
export const FIELD_STATE_EMPTY = 1
export const FIELD_STATE_RED = 2
export const FIELD_STATE_GREEN = 3


export function Field(state, x, y) {
    this.fieldState = state;
    this.posX = x;
    this.posY = y;
    this.underField = [];
    this.tower = [this.fieldState];

    this.onOvergrown = () => console.log('overgrown occurred');
}

export function cloneField(field) {
    const f = new Field(field.fieldState, field.posX, field.posY);
    f.underField = JSON.parse(JSON.stringify(field.underField));
    f.onOvergrown = field.onOvergrown;

    return f;
}

Field.prototype.getFieldHeight = function() {
    return this.underField.length + 1;
}

Field.prototype.moveToField = function(toField) {

    if (this.fieldState & FIELD_STATE_UNPLAYABLE) {
        throw Error('Trying to move unplayable field');
    }

    const distance = Math.abs(toField.posX - this.posX) || Math.abs(toField.posY - this.posY);

    const oldState = this.fieldState;

    updateElements(this, toField, distance - 1);
    toField.fieldState = oldState;

    
    toField.tower = [toField.fieldState].concat(toField.underField);
    this.tower = [this.fieldState].concat(this.underField);
    reduceOverGrown(toField);
}

function updateElements(fromField, toField, distance) {
    const underElements = shiftElements(fromField, distance);

    if (toField.fieldState === FIELD_STATE_EMPTY) {
        toField.underField = underElements;
    } else {
        toField.underField = underElements.concat([toField.fieldState]).concat(toField.underField);
    }
}

function shiftElements(field, n) {
    const firstElements = [];

    while (n > 0) {
        const element = field.underField.shift() || null;

        if (element) {
            firstElements.push(element);
        }
        
        n--;
    }

    // update the this.state to next element under
    field.fieldState = field.underField.shift() || FIELD_STATE_EMPTY;

    return firstElements;
}

function reduceOverGrown(field) {
    while (field.tower.length > 5) {
        const fieldState = field.underField.pop();
        field.tower.pop();

        if (field.onOvergrown) {
            field.onOvergrown(field, fieldState);
        }
    }
}

Field.prototype.placeAtTop = function(newState) {
    this.underField = [this.fieldState].concat(this.underField);
    this.fieldState = newState;

    this.tower = [this.fieldState].concat(this.underField);
    reduceOverGrown(this);
    this.tower = [this.fieldState].concat(this.underField);
}