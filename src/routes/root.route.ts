import { ServerRoute } from '@hapi/hapi'

const routes: ServerRoute[] = [
    {
        path: '/',
        method: 'GET',
        handler: async (req, kit) => {
            return `<h1>Home Page</h1>`
        }
    }
]

export default routes
