import * as pino from 'hapi-pino'
import { ServerRegisterPluginObject } from '@hapi/hapi'

const isDEV = process.env['NODE_ENV'] === 'development'

const pluginOpt: ServerRegisterPluginObject<pino.Options> = {
    plugin: pino,
    options: {
        level: isDEV ? 'debug' : 'info',
        mergeHapiLogData: true,
        logRouteTags: true,
    },
}

export default pluginOpt
