/**
 * AUTO COLLECTING ALL OF PLUGIN CONFIG FILE
 * IN CURRENT DICTIONARY.
 * THAT WILL BE THE STANDARD HANDLING BELOW.
 */
import collectFiles from '../utils/collect-files'
import { ServerRegisterPluginObject } from '@hapi/hapi'

const plugins = collectFiles<ServerRegisterPluginObject<object>>(__dirname)

export default plugins
