
export function randomInteger(min?: number, max?: number) {
    min = min || 0
    max = max || Number.MAX_SAFE_INTEGER

    return Math.floor(Math.random() * (max - min) + min)
}

export function randomBoolean() {
    const random = Math.random()

    return random <= 0.5
}

export interface IPredicate<T> {
    (obj: T): boolean
}