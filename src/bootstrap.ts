import { Server } from '@hapi/hapi'
import server from './server'
import {
    setupRoutes,
    setupPlugins,
    setupSettings,
} from './utils'


/**
 * bootstrap executor
 * @param server target hapi server instance
 */
async function bootstrap(server: Server) {

    // parallel setup task
    await Promise.all([
        // setup all plguins
        setupPlugins(server),
        // setup all route options
        setupRoutes(server)
    ])

    // setup host and port
    await setupSettings(server)

    await server.start()
}

/**
 * process error handler
 */
process
    .on('unhandledRejection', (err) => {
        console.error(err)
        process.exit(1)
    })
    .on('uncaughtException', (err) => {
        console.error(err)
        process.exit(1)
    })

/**
 * statup
 */
bootstrap(server)
