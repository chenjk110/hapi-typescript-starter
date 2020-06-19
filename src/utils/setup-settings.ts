import { Server, ServerOptions } from '@hapi/hapi'
import { envConfig } from './envs'

/**
 * mrege server settings
 * @param server hapi server instance
 */
export async function setupSettings(server: Server, opts?: Partial<ServerOptions>) {

    const host = opts?.host
        ?? process.env['PORT']
        ?? envConfig['HOST']
        ?? 'localhost'

    const port = opts?.port
        ?? process.env['PORT']
        ?? envConfig['PORT']
        ?? 3000

    server.settings.host = host
    server.settings.port = port
}