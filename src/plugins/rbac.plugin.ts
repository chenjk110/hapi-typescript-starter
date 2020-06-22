import * as rbac from 'hapi-rbac/lib/index'

import { ServerRegisterPluginObject } from '@hapi/hapi'


// const isDEV = process.env['NODE_ENV'] === 'development'

/// DOC: https://github.com/franciscogouveia/hapi-rbac/blob/master/API.md
const pluginOpt: ServerRegisterPluginObject<rbac.Options> = {
    plugin: rbac,
    options: {

    },
}

export default pluginOpt
