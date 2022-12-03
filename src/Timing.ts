import { TimeTask } from './TimeTask'

const TimingContext = {
    delta: 0,
    lastTime: 0,
    tasks: [] as TimeTask[],
    initialized: false
}

export function initializeTiming(): void {
    requestAnimationFrame(animationTimeFunction)
    TimingContext.initialized = true
}

function endTask(task: TimeTask): void {
    task.onExpired.call(task.onExpiredContext)
}

function animationTimeFunction(time: number): void {

    TimingContext.delta = 0.001 * (time - TimingContext.lastTime)
    TimingContext.lastTime = time

    TimingContext.tasks.forEach(task => task.update(TimingContext.delta))

    TimingContext.tasks.filter(task => task.hasExpired).forEach(endTask)

    TimingContext.tasks = TimingContext.tasks.filter(v => !v.hasExpired)


    requestAnimationFrame(animationTimeFunction)
}

type TimeRejectFn = {
    (e: Error): void
}


type TimeResolveFn = {
    (): void
}

function createNewTimeTask(time: number, resolve: TimeResolveFn, reject: TimeRejectFn): TimeTask {
    if (!TimingContext.initialized) {
        reject(Error('Timing not initialized'))
        return null
    }

    const task = new TimeTask(time, resolve, null)
    TimingContext.tasks.push(task)

    console.log(TimingContext.tasks)
    return task
}

/**
 * Runs a timeout on js event loop
 * @param {number} time in seconds
 * @returns Promise resolved, when time ended or rejected if timing is not initialized
 */
export function runTimeout(time: number): Promise<void> {
    return new Promise<void>((resolve, reject) => createNewTimeTask(time, resolve, reject))
}

export function addTimeTask(task: TimeTask): void {
    if (!task.hasExpired) {
        TimingContext.tasks.push(task)
    }
}