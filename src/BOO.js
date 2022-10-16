import EventEmitter from 'eventemitter3'

const FIELD_STATE_UNPLAYABLE = 1
const FIELD_STATE_EMPTY = 2
const FIELD_STATE_PLAYER_A = 4
const FIELD_STATE_PLAYER_B = 8

const DIRECTION_SOUTH = { x: 0, y: 1 }
const DIRECTION_NORTH = { x: 0, y: -1 }
const DIRECTION_EAST = { x: 1, y: 0 }
const DIRECTION_WEST = { x: -1, y: 0 }

const MAX_TOWER_HEIGHT = 5

const GameBoard = [{ state: FIELD_STATE_EMPTY, height: 0, top: null }]

for (let i = 1; i < 64; i++) {
    GameBoard[i] = { state: FIELD_STATE_EMPTY, height: 0, top: null }
}

const PLAYER_A = { state: FIELD_STATE_PLAYER_A, pooledFields: 0 }
const PLAYER_B = { state: FIELD_STATE_PLAYER_B, pooledFields: 0 }

let currentPlayer = PLAYER_A


function getField(x, y) {
    return GameBoard[x + 8 * y] || null
}

function getNextPlayer() {
    if (currentPlayer.state & FIELD_STATE_PLAYER_A)
        return PLAYER_B

    return PLAYER_A
}

function countEnemyFields() {
    const player = getNextPlayer()

    const count = GameBoard.reduce((accumulated, current) => {
        if (player.state & current.state)
            accumulated++

        return accumulated
    }, 0)

    return count
}

function getOffsetBasedOnFieldHeight(field, direction) {
    return { x: direction.x * field.height, y: direction.y * field.height }
}

function doesOwnThisField(player, field) {
    return !!(field.state & player.state)
}

function isOutOfBounds(field) {
    return !field || field.state & FIELD_STATE_UNPLAYABLE
}

function isOvergrown(field) {
    return field.height >= MAX_TOWER_HEIGHT
}

function moveToNewField(fromField, toField) {
    toField.top = {state: fromField.state, top: fromField.top}
    toField.height = fromField.height + 1
    toField.state = fromField.state
    
    fromField.height = 0
    fromField.state = FIELD_STATE_EMPTY
    fromField.top = null
}

const GEvents = new EventEmitter()

function getFieldToJump(field, direction, x, y) {
    const offset = getOffsetBasedOnFieldHeight(field, direction)
    const fieldToJump = getField(x + offset.x, y + offset.y)

    return fieldToJump
}

function detectedOvergrowthElement(field, fieldToJump) {
    field.height = MAX_TOWER_HEIGHT - 1

    // check is the hit on our field
    if (fieldToJump.state & currentPlayer.state) {
        jumpedOnOurField()
    }
}

function jumpedOnOurField() {
    currentPlayer.pooledFields++
    GEvents.emit('new_field_in_pool', currentPlayer)
}

/**
 * Moves from (x, y) to (x + direction.x * field.height, y + direction.y * field.height)
 * @param {number} x 
 * @param {number} y 
 * @param {object} direction 
 * @returns true, if move from x, y to destination can be done
 * @returns false, if field from x,y does not belong to current player or it's out of bounds
 */
function moveToField(x, y, direction) {
    const field = getField(x, y)

    if (!doesOwnThisField(currentPlayer, field))
        return false

    const fieldToJump = getFieldToJump(field, direction, x, y)

    if (isOutOfBounds(fieldToJump))
        return false

    if (isOvergrown(field))
        detectedOvergrowthElement(field, fieldToJump)

    moveToNewField(field, fieldToJump)

    GEvents.emit('field_changed', x, y)
    return true
}

function placeFromPool(player, x, y) {
    if (player.pooledFields <= 0)
        return
    
    const field = getField(x, y)
    
    if (field.height === MAX_TOWER_HEIGHT) {
        const it = field.top

        while (it && it.top != null) {
            it = it.top
        }

        console.log(it)
    }


    player.pooledFields--
    GEvents.emit('field_was_placed', x, y, player)
} 

function checkForVictoryCondition() {
    const countOfEnemyFields = countEnemyFields()

    if (countOfEnemyFields === 0) {
        checkForAnyPool()
    }
}

PLAYER_B.pooledFields = 1

// setup fields
getField(1, 1).height = 1
getField(1, 1).state = PLAYER_A.state

getField(1, 6).height = 1
getField(1, 6).state = PLAYER_A.state

getField(2, 1).height = 1
getField(2, 1).state = PLAYER_A.state

getField(1, 2).height = 1
getField(1, 2).state = PLAYER_B.state

getField(3, 2).height = 4
getField(3, 2).state = PLAYER_B.state

/* Advanced UI */
const txt = document.createElement('div')
document.body.append(txt)
txt.innerHTML = GameBoard.map(v => JSON.stringify(v)).join(' , ')

GEvents.on('field_changed', () => txt.innerHTML = GameBoard.map(v => JSON.stringify(v)).join(' , '))
GEvents.on('field_changed', checkForVictoryCondition)

GEvents.on('new_field_in_pool', player => console.log('Added element to pool' + JSON.stringify(player)))
GEvents.on('victory_condition', player => console.log('player ' + JSON.stringify(player) + ' won'))


moveToField(1, 1, DIRECTION_SOUTH)
moveToField(1, 2, DIRECTION_EAST)
function checkForAnyPool() {
    const player = getNextPlayer()

    if (player.pooledFields === 0)
        GEvents.emit('victory_condition', currentPlayer)
    else
        GEvents.emit('poolAvailable', player)
}

GEvents.on('poolAvailable', () => placeFromPool(getNextPlayer(), 3, 2))


//moveToField(1, 6, DIRECTION_NORTH)


