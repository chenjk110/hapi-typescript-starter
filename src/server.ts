import { Server, ServerOptions } from '@hapi/hapi'

const options: ServerOptions = {
    host: 'localhost',
    port: 3000,
    state: {
        // turn off if you provide other features 
        strictHeader: false,
    }
}

const server = new Server(options)

export default server

