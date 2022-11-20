

const debugDiv = document.getElementById('debug') as HTMLDivElement

export function debugLog(...args: any[])
{
    let str = ''

    for (const obj of args)
    {
        str = str.concat(String(obj))
    }

    debugDiv.innerText = str
}