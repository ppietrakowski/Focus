
export function randomInteger(min?: number, max?: number)
{
    min = min || 0
    max = max || Number.MAX_SAFE_INTEGER

    return Math.floor(Math.random() * (max - min) + min)
}

export function randomBoolean()
{
    const random = Math.random()

    return random <= 0.5
}

let id = 0

export function runTimeout(delayInSeconds: number)
{
    id++
    return new Promise<void>(resolve => setTimeout(resolve, delayInSeconds * 1000))
}

export interface IPredicate<T>
{
    (obj: T): boolean
}