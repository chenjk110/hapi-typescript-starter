const chalk = require('chalk')
const fs = require('fs-extra')
const path = require('path')

const tsCostMark = () => {
    return Object.seal({
        tsBegin: Date.now(),
        tsEnd: Date.now(),
        tsCost: 0,
        toString() {
            const sec = Math.floor(this.tsCost / 1000)
            const ms = this.tsCost % 1000
            return `\n(total cost: ${sec}s${ms}ms)\n`
        },
        done() {
            this.tsEnd = Date.now()
            this.tsCost = this.tsEnd - this.tsBegin
            return Object.freeze(this)
        }
    })
}
const info = (...args) => console.log(chalk.cyanBright(...args))
const infoSucceed = (...args) => console.log(chalk.greenBright(...args))
const infoError = (...args) => console.log(chalk.redBright(...args))

/**
 * copy files
 * @param {string} dirDest 
 * @param {string[]} fileSrcList 
 */
const copyFiles = async (dirDest, fileSrcList, print = false) => {
    const cpTasks = fileSrcList.map((fileSrc, idx) => {
        const fileInfo = path.parse(fileSrc)
        const fileDest = path.join(dirDest, fileInfo.base)
        let printDone = () => { }
        if (print) {
            const percent = `${idx + 1}/${fileSrcList.length}`
            const processText = `\n\nCOPY [${percent}]:\n${fileSrc}\n---> ${fileDest}\n\n`
            printDone = () => info(processText)
        }
        return fs.copyFile(fileSrc, fileDest).then(printDone)
    })

    await Promise.all(cpTasks)

    return true
}

module.exports = {
    copyFiles,
    infoError,
    infoSucceed,
    info,
    tsCostMark,
}