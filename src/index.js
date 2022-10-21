import { DIRECTION_EAST, DIRECTION_NORTH, DIRECTION_SOUTH, DIRECTION_WEST, Field, FIELD_STATE_EMPTY, FIELD_STATE_PLAYER_A, FIELD_STATE_PLAYER_B } from './Field'
import { Focus } from './Game'

const gameFocus = new Focus()


// Advanced UI :DDD
const txt = document.createElement('div')
document.body.append(txt)


gameFocus.events.on(Focus.MOVED_FIELD, () => txt.innerHTML = gameFocus._gameBoard._grid.map(v => v.state === FIELD_STATE_EMPTY ? "0" : JSON.stringify(v)).join(' , '))
gameFocus.events.on(Focus.ADDED_ITEM_TO_POOL, player => console.log('player ', JSON.stringify(player), 'get a new item in pool'))

gameFocus.nextTurn()

txt.innerHTML = gameFocus._gameBoard._grid.map(v => v.state === FIELD_STATE_EMPTY ? "0" : JSON.stringify(v)).join(' , ')
