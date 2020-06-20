const execa = require('execa')
const fs = require('fs-extra')
const path = require('path')
const assert = require('assert')
const ora = require('ora')
const chalk = require('chalk')
const {
    info,
    infoError,
    infoSucceed,
    tsCostMark,
} = require('./utils')
const { isThrowStatement } = require('typescript')

const pathRoot = path.resolve(__dirname, '..')
const pathDist = path.resolve(__dirname, '..', 'dist')

/**
 * get current username
 */
const getAuthor = async () => {
    let username = (await execa.command('git config user.name')).stdout.toString()

    if (!username) {
        username = (await execa.command('whoami')).stdout.toString()
    }

    return username
}

/**
 * replece dockerfile's value
 * @param {string} tplStr 
 */
const dockerfileNameReplacer = (tplStr) => {

    const dockerfileNames = {
        imageName: '{{IMAGE_NAME}}',
        imageTagName: '{{IMAGE_TAG_NAME}}',
        portValue: '{{PORT_VALUE}}',
        sourceDirName: '{{SOURCE_DIR_NAME}}',
        destDirName: '{{DEST_DIR_NAME}}',
        updatedName: '{{UPDATED}}',
        author: '{{AUTHOR}}'
    }

    return {
        /**
         * replacement
         * @param {keyof typeof dockerfileNames} name 
         * @param {any} value 
         */
        replace(name, value) {
            const holder = dockerfileNames[name]
            const re = new RegExp(holder, 'g')
            tplStr = tplStr.replace(re, value)
            return this
        },
        toString() {
            return tplStr
        }
    }
}

/**
 * create dockerfile
 * @param {string|number} port expose PORT
 * @param {string} image base image
 * @param {string} tag image's tag
 * @param {string} srcDir COPY [src] dir
 * @param {string} destDir COPY [dest] dir
 */
async function generateDockerfileContent(port, image, tag, srcDir, destDir) {

    assert(typeof port === 'number' || !isNaN(+port),
        'port param should be parsed to number.')

    /// tpl file path
    const tplFilePath = path.resolve(__dirname, './dockerfile_tpl')

    /// read tpl file
    const dockerfileTpl = (await fs.readFile(tplFilePath)).toString()

    /// create a dockerfile replacer
    const valueReplacer = dockerfileNameReplacer(dockerfileTpl)

    valueReplacer
        .replace('imageName', image)
        .replace('imageTagName', tag)
        .replace('sourceDirName', srcDir)
        .replace('destDirName', destDir)
        .replace('portValue', port)
        .replace('updatedName', new Date().toLocaleString())
        .replace('author', await getAuthor())

    return valueReplacer.toString()
}

/**
 * store dockerfile content
 * @param {string} storeDirname dirname for storing dockerfile
 * @param {string} content 
 */
async function writeDockerfile(storeDirname, content) {

    assert(typeof storeDirname === 'string',
        'dirname param should be a string.')

    // get target file path to store
    const pathToStore = path.join(storeDirname, 'dockerfile')

    info(`createing ${pathToStore}.`)

    try {
        await fs.writeFile(pathToStore, content)
        infoSucceed('dockerfile creating succeed!')
    } catch (err) {
        infoError('creating dockerfile faild.\n')
        infoError(`===> ${err.message}\n`)
        throw err
    }
}


/**
 * buiding docker image
 * @param {string} name target image name
 * @param {string} tag target image tag
 * @param {string} cwd current workdir
 */
async function buildDockerImage(name, tag, cwd) {

    assert(typeof name === 'string',
        'should pass `name` param for building docker image.')

    assert(typeof tag === 'string',
        'should pass `tag` param for building docker image.')

    assert(typeof cwd === 'string',
        'should pass `cwd` param for building docker image.')

    assert(await checkDocker(),
        'docker engine has not found!!!')

    const spinner = ora(`Buiding Docker Image (${name}:${tag})...\n`).start()
    try {
        const output = await execa.command(
            `docker image build -t ${name}:${tag} ${cwd}`,
        )

        if (output.stderr) {
            throw new Error(output.stderr.toString())
        }

        spinner.succeed(`Image Built Succeed!`)

        console.log(chalk.grey('\n----------- result ------------\n'))
        console.log(chalk.grey(output.stdout))
        console.log(chalk.grey('\n-------------------------------\n'))
    } catch (err) {
        spinner.fail(err.message)
        throw err
    }

    return true
}

/**
 * check docker engine valid
 */
async function checkDocker() {
    const { stdout } = await execa.command('docker --version')
    if (/docker version/ig.test(stdout.toString())) {
        return stdout.toString()
    }
    return ''
}

/**
 * check dist dir valid
 */
async function checkDistDir() {
    const checkedList = [
        'package.json',
        'server.js',
        'bootstrap.js',
        'env'
    ]
    try {
        const { isDirectory } = await fs.stat(pathDist)
        if (isDirectory) {
            const checkTasks = checkedList.map(name => {
                const filePath = path.join(pathDist, name)
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

/**
 * checking all precondition
 */
async function preChecking() {
    const spinnerCheckDocker = ora({
        spinner: 'point',
        text: 'checking docker engine.',
    }).start()

    const spinnerCheckDistDir = ora({
        spinner: 'point',
        text: 'checking dist dir.',
    }).start()

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
        checkDocker(pathRoot).then(version => {
            if (version) {
                spinnerCheckDocker.succeed(version)
            }
            else {
                valid = false
                spinnerCheckDocker.fail('docker engine not found.')
            }
        }),
        /// checking dist dir
        checkDistDir(pathRoot).then(res => {
            if (res instanceof Error) {
                valid = false
                spinnerCheckDistDir.fail(res.message)
            }
            else {
                spinnerCheckDistDir.succeed('`dist` dir checking succeed.')
            }
        }),
        /// checking configurations
        // checkDockerFile().then(res => {

        // })

    ])

    if (!valid) {
        throw new Error(chalk.yellow('please check the problems above and retry.'))
    }
}

async function execute() {

    await preChecking()

    const inquirer = require('inquirer')

    //// image using options ///

    const optionsImage = await inquirer.prompt([
        {
            name: 'image',
            default: 'node',
            message: 'Please input base image name: ',
            type: 'input'
        },
        {
            name: 'tag',
            default: '12',
            message: 'Please input base image\'s tag value: ',
            type: 'input'
        },
        {
            name: 'srcDir',
            default: './dist',
            message: 'Please input dir of built code with COPY: ',
            type: 'input'
        },
        {
            name: 'destDir',
            default: '/var/www/app',
            message: 'Please input dest dir of image with COPY: ',
            type: 'input'
        },
        {
            name: 'port',
            default: 3000,
            validate(value, ans) {
                value = Number(value)
                if (!isNaN(value) && value >= 0 && value <= 65535) {
                    return true
                }
                ans.port = 3000
                return 'should range of [0, 65535]'
            },
            message: 'Please input exposing port of image: ',
            type: 'input'
        },
    ])

    ////// iamge buit options ///////

    const optionsBuild = await inquirer.prompt([
        {
            name: 'image',
            default: optionsImage.image,
            message: 'Please input built image\'s name: ',
            type: 'input'
        },
        {
            name: 'tag',
            default: 'test',
            message: 'Please input built image\'s tag: ',
        }
    ])

    //// generating dockerfile content
    const dockerfileContent = await generateDockerfileContent(
        Number(optionsImage.port),
        optionsImage.image,
        optionsImage.tag,
        optionsImage.srcDir,
        optionsImage.destDir
    )

    /// confirm to store content
    const { confirm } = await inquirer.prompt([
        {
            name: 'confirm',
            default: true,
            message: [
                'Confirm the dockerfile\'s content?',
                '------------------------------------------',
                dockerfileContent,
                '------------------------------------------',
                chalk.cyanBright('confirm this dockerfile\'s content: '),
            ].join('\n'),
            type: 'confirm'
        }
    ])

    /// store content
    if (confirm) {

        await writeDockerfile(
            pathRoot,
            dockerfileContent
        )

        const { confirmBuild } = await inquirer.prompt([
            {
                name: 'confirmBuild',
                default: false,
                message: 'Begin to build docker image?',
                type: 'confirm',
            }
        ])

        if (confirmBuild) {
            const cost = tsCostMark()

            await buildDockerImage(
                optionsBuild.image,
                optionsBuild.tag,
                pathRoot,
            )

            console.log(
                chalk.green(`Docker Image (${optionsBuild.image}:${optionsBuild.tag}) Built Succeed!`)
                + chalk.grey(` ${cost.done().toString()}`)
            )
        }

    }


    console.log(chalk.green('\nAll Done!\n'))
}

execute().catch(err => {
    infoError(err.message)
    process.exit(1)
})