import * as pino from 'hapi-pino'
import { ServerRegisterPluginObject } from '@hapi/hapi'

const pluginOpt: ServerRegisterPluginObject<pino.Options> = {
    plugin: pino,
    options: {
        level: 'debug',
        mergeHapiLogData: true,
        logRouteTags: true,
    },
}

export default pluginOpt
