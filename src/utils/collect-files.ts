import { readdir } from 'fs'
import { promisify } from 'util'
import { join } from 'path'

export async function collectFiles<T extends object | Function>(
    dirname: string,
    ignoreList: string[] = [],
): Promise<T[]> {

    // concat default ignore '.', '..'
    const ignoreMarked = ignoreList
        .concat('.', '..', 'index', 'index.ts', 'index.js')
        .reduce((marked, name) => {
            marked[name] = true
            return marked
        }, Object.create(null));

    const filenames = await promisify(readdir)(dirname)

    return filenames
        .filter(name => !ignoreMarked[name])
        .map((name) => {
            let file = require(join(dirname, name))

            // fix module
            if ('default' in file) {
                file = file['default']
            }
            else if ('exports' in file) {
                file = file['exports']
            }

            file = Array.isArray(file) ? file : [file]

            return file as T
        })
}

export default collectFiles
