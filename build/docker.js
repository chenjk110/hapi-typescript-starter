const execa = require('execa')
const fs = require('fs-extra')
const path = require('path')
const assert = require('assert')
const ora = require('ora')
const {
    info,
    infoError,
    infoSucceed,
} = require('./utils')

/**
 * create dockerfile
 * @param {string} dirname dirname for storing dockerfile
 * @param {string|number} port expose PORT
 */
async function createDockerfile(dirname, port) {
    assert(typeof dirname === 'string',
        'dirname param should be a string.')
    assert(typeof port === 'number' || !isNaN(+port),
        'port param should be parsed to number.')

    /////////////////  dockerfile template ////////////////////
    ///////////////////////////////////////////////////////////
    const fileTpl = `\
#
# Generated: ${new Date().toUTCString()}
#

FROM node:12

EXPOSE ${port}

ENV DIST_DIR /var/www/app

COPY ./dist \${DIST_DIR}

WORKDIR \${DIST_DIR}

RUN ["npm", "install"]

CMD ["NODE_ENV=production", "node", "bootstrap.js"]
`
    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////

    const targetPath = path.join(dirname, 'dockerfile')
    info(`createing dokerfile at ${targetPath}...\n`)
    try {
        await fs.writeFile(targetPath, fileTpl)
        infoSucceed('dockerfile created.\n')
    } catch (err) {
        infoError('creating dockerfile faild.\n')
        infoError(`===> ${err.message}\n`)
        throw err
    }
}


async function buildDockerImage(tag, cwd) {

    assert(typeof tag === 'string',
        'should pass `tag` param for building docker image.')

    assert(typeof cwd === 'string',
        'should pass `cwd` param for building docker image.')

    assert(await checkDocker())

    if (!hasDocker) {
        return infoError('docker engine has not found!!!\n')
    }

    if (!(tag && typeof tag === 'string')) {
        return infoError('require tag param.')
    }

    await execa.command(`docker image build -t ${tag} ${cwd}`, { stdout: process.stdin })
}

async function checkDocker() {
    const { stdout } = await execa.command('docker --version')
    if (/docker version/ig.test(stdout.toString())) {
        return stdout.toString()
    }
    return ''
}

async function checkDistDir(dirname) {
    const targetPath = path.join(dirname, 'dist')
    const checkedList = [
        'package.json',
        'server.js',
        'bootstrap.js',
        '.env'
    ]
    try {
        const { isDirectory } = await fs.stat(targetPath)
        if (isDirectory) {
            const checkTasks = checkedList.map(name => {
                const filePath = path.join(targetPath, name)
                return fs.stat(filePath)
            })
            await Promise.all(checkTasks)
            return true
        }
        else {
            return new Error('dist is not a dir.')
        }
    } catch (err) { return err }
}

async function preChecking(dirname) {
    const spinnerCheckDocker = ora({
        spinner: 'point',
        text: 'checking docker engine.',
    })

    const spinnerCheckDistDir = ora({
        spinner: 'point',
        text: 'checking dist dir.',
    })

    // const spinnerCheckConfig = ora({
    //     spinner: 'point',
    //     text: 'checking config.',
    // })

    spinnerCheckDocker.start()
    spinnerCheckDistDir.start()
    // spinnerCheckConfig.start()

    let valid = true

    await Promise.all([
        /// chekcing docker engine
        checkDocker(dirname).then(version => {
            if (version) {
                spinnerCheckDocker.succeed(version)
            }
            else {
                valid = false
                spinnerCheckDocker.fail('docker engine not found.')
            }
        }),
        /// checking dist dir
        checkDistDir(dirname).then(res => {
            if (res instanceof Error) {
                valid = false
                spinnerCheckDistDir.fail(res.message)
            }
            else {
                spinnerCheckDistDir.succeed('`dist` dir checking succeed.')
            }
        }),
        /// checking configurations

    ])

    if (!valid) {
        return info('please check the problems above and retry.')
    }
}

async function execute() {
    const cwd = path.resolve(__dirname, '..')
    const tagName = process.argv

    await preChecking()
}

execute().catch(err => {
    infoError(err.message)
    process.exit(1)
})