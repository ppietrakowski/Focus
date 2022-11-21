

const debugDiv = document.getElementById('debug') as HTMLDivElement

export function debugLog<Args>(...args: Args[]) {
    let str = ''

    for (const obj of args) {
        str = str.concat(String(obj))
    }

    debugDiv.innerText = str
}