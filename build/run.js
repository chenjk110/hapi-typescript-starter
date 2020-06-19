const ora = require('ora')
const { infoError, copyFiles, tsCostMark, info } = require('./utils')
const { readFile, writeFile } = require('fs-extra')
const { command } = require('execa')
const { resolve } = require('path')
const chalk = require('chalk')

const dirRoot = resolve(__dirname, '..')
const dirDest = resolve(dirRoot, 'dist')
const dirSrc = resolve(dirRoot, 'src')
const assetFiles = [
    '.env',
].map(name => resolve(dirRoot, name))

/**
 * exec command helper
 * @param {string} commands 
 */
const execCommand = (commands) => {
    return command(commands, { cwd: dirRoot })
}

const normalizePkgFile = async () => {
    const pkgContent = await readFile(resolve(dirRoot, 'package.json'))
    const pkg = JSON.parse(pkgContent)
    if ('devDependencies' in pkg) {
        pkg['devDependencies'] = undefined
    }
    if ('scripts' in pkg) {
        pkg['scripts'] = undefined
    }
    if ('main' in pkg) {
        pkg['main'] = 'bootstrap.js'
    }
    await writeFile(
        resolve(dirDest, 'package.json'),
        JSON.stringify(pkg, null, 2),
    )
}

/**
 * single async task
 * @param {() => Pormise<any>} runner 
 * @param {string} msg 
 */
const task = async (runner, msg) => {
    const printText = ` [TASK] --- ${msg} -`.padEnd(80, '-')
    const spinner = ora(chalk.green(printText)).start()
    try {
        await runner()
    } catch (err) {
        spinner.fail(err.message)
        throw err
    }
    spinner.succeed()
}

/**
 * main entrypoint
 */
async function execute() {

    const cost = tsCostMark()

    info('==== BUILDING [mode: production] ====')

    // clean dist dir
    await task(() => execCommand('rm -rf dist'),
        'Removing `dist` Dir')

    // compile 
    await task(() => execCommand(`tsc`),
        'Compiling')

    // copy files
    await task(() => copyFiles(dirDest, assetFiles),
        'Copying Files')

    // normalize package.json
    await task(() => normalizePkgFile(),
        'Generating `package.json`')

    ora().succeed('SUCCEED!')

    // print total time cost
    info(cost.done().toString())
}

/**
 * run up
 */
execute().catch(err => {
    infoError(err.message)
    process.exit(1)
})