import * as DotEnv from 'dotenv'
import { readFileSync } from 'fs'
import { resolve } from 'path'

export const isDEV = process.env['NODE_ENV'] === 'development'

const envName = isDEV ? 'env.dev' : 'env'
const envPath = resolve(envName)

export const envConfig = DotEnv.parse(
    readFileSync(envPath),
    { debug: isDEV },
)