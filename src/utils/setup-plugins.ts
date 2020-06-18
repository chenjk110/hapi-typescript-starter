import { Server, ServerRegisterPluginObject } from "@hapi/hapi";
import collectingPlugins from '../plugins'

export async function setupPlugins(
    server: Server,
    plugins?: ServerRegisterPluginObject<any>[],
) {
    /**
     * auto setup plugins that defined in `src/plugins`.
     */
    plugins = plugins ?? await collectingPlugins

    await Promise.all(
        plugins.map(pluginOpt => server.register(pluginOpt))
    )
}

export default setupPlugins
