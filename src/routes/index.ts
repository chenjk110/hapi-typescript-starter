/**
 * AUTO COLLECTING ALL OF ROUTE CONFIG FILE
 * IN CURRENT DICTIONARY.
 * THAT WILL BE THE STANDARD HANDLING BELOW.
 */
import collectFiles from '../utils/collect-files'
import { ServerRoute } from '@hapi/hapi'

const routes = collectFiles<ServerRoute>(__dirname)

export default routes
