import { ServerRoute } from "hapi";

const routes: ServerRoute[] = [
    {
        path: '/login',
        method: 'GET',
        handler: async (req, kit) => {
            return `Hello, Login`
        }
    },
    {
        path: '/login',
        method: 'POST',
        handler: async (req, kit) => {
            const {
                username, password,
            } = req.payload as Dtos.LoginBody
            if (username === 'admin' && password === 'admin') {
                return {
                    statusCode: 200,
                    message: 'succees',
                }
            } else {
                return {
                    statusCode: 401,
                    message: 'username or password invalid'
                }
            }
        }
    }

]

export default routes
