import { ServerRoute } from "@hapi/hapi";
import * as Joi from '@hapi/joi'

const routes: ServerRoute[] = [
    {
        path: '/login',
        method: 'GET',
        handler: async (req, h) => {
            return `Hello, Login`
        }
    },
    {
        path: '/login',
        method: 'POST',
        options: {
            validate: {
                payload: Joi.object({
                    username: Joi.string().min(6).max(16).required(),
                    password: Joi.string().min(6).max(16).required(),
                }).options({ stripUnknown: true }),
                failAction: (req, h, err) => err
            },
        },
        handler: async (req, h) => {
            const { username, password } = req.payload as DTOs.ILoginBody

            if (username === '123456' && password === '123456') {
                const res: DTOs.IResBase = {
                    code: 0,
                    msg: 'success'
                }
                return res
            } else {
                const res: DTOs.IResBase = {
                    code: -1,
                    msg: 'username or password invalid.'
                }
                return res
            }
        },
    }

]

export default routes
