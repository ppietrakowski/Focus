import { DIRECTION_EAST, DIRECTION_NORTH, DIRECTION_SOUTH, DIRECTION_WEST, Field, FIELD_STATE_EMPTY, FIELD_STATE_PLAYER_A, FIELD_STATE_PLAYER_B } from './Field'
import { Focus } from './Game'

const gameFocus = new Focus()

gameFocus._gameBoard.setFieldAt(1, 2, FIELD_STATE_PLAYER_A)
gameFocus._gameBoard.setFieldAt(1, 1, FIELD_STATE_PLAYER_B)
gameFocus._gameBoard.setFieldAt(3, 1, FIELD_STATE_PLAYER_B)
gameFocus._gameBoard.setFieldAt(2, 1, FIELD_STATE_PLAYER_A)

gameFocus._gameBoard.getFieldAt(3, 1)._top.push({state: FIELD_STATE_PLAYER_B})
gameFocus._gameBoard.getFieldAt(3, 1)._top.push({state: FIELD_STATE_PLAYER_B})
gameFocus._gameBoard.getFieldAt(3, 1)._top.push({state: FIELD_STATE_PLAYER_B})
gameFocus._gameBoard.getFieldAt(3, 1)._top.push({state: FIELD_STATE_PLAYER_A})


// Advanced UI :DDD
const txt = document.createElement('div')
document.body.append(txt)


gameFocus.events.on(Focus.MOVED_FIELD, () => txt.innerHTML = gameFocus._gameBoard._grid.map(v => v.state === FIELD_STATE_EMPTY ? "0" : JSON.stringify(v)).join(' , '))
gameFocus.events.on(Focus.ADDED_ITEM_TO_POOL, player => console.log('player ', JSON.stringify(player), 'get a new item in pool'))

gameFocus.nextTurn()
gameFocus.moveToField(1, 1, DIRECTION_EAST, 1)

gameFocus.moveToField(2, 1, DIRECTION_EAST, 1)

txt.innerHTML = gameFocus._gameBoard._grid.map(v => v.state === FIELD_STATE_EMPTY ? "0" : JSON.stringify(v)).join(' , ')
