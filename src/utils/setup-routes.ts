import { Server, ServerRoute } from '@hapi/hapi';
import collectingRoutes from '../routes';

export async function setupRoutes(
    server: Server,
    routes?: ServerRoute[],
) {
    /**
     * auto setup routes that defined in
     * `src/routes` dictionry.
     */
    routes = routes ?? await collectingRoutes

    await Promise.all(
        routes.map(routeOpt => server.route(routeOpt))
    )
}

export default setupRoutes
