# hapi typescript starter

## Define route options

define your route options in `src/routes` dir, all routes files will be registered automatically when bootstrap. example：

```ts
///  define a login route
import { ServerRoute } from "@hapi/hapi";
import * as Joi from "@hapi/joi";

const routes: ServerRoute[] = [
  {
    path: "/login",
    method: "GET",
    handler: async (req, h) => {
      return `Hello, Login`;
    },
  },
  {
    path: "/login",
    method: "POST",
    options: {
      validate: {
        payload: Joi.object({
          username: Joi.string().min(6).max(16).required(),
          password: Joi.string().min(6).max(16).required(),
        }).options({ stripUnknown: true }),
        failAction: (req, h, err) => err,
      },
    },
    handler: async (req, h) => {
      const { username, password } = req.payload as DTOs.ILoginBody;

      if (username === "123456" && password === "123456") {
        const res: DTOs.IResBase = {
          code: 0,
          msg: "success",
        };
        return res;
      } else {
        const res: DTOs.IResBase = {
          code: -1,
          msg: "username or password invalid.",
        };
        return res;
      }
    },
  },
];

export default routes;
```

## Define plugins

define pulgin in `src/plugins` dir and all file will be registered automatically when bootstrap.

```ts
import * as pino from "hapi-pino";
import { ServerRegisterPluginObject } from "@hapi/hapi";

const isDEV = process.env["NODE_ENV"] === "development";

const pluginOpt: ServerRegisterPluginObject<pino.Options> = {
  plugin: pino,
  options: {
    level: isDEV ? "debug" : "info",
    mergeHapiLogData: true,
    logRouteTags: true,
  },
};

export default pluginOpt;
```

## Specifiy env values

- `env` -> `productionn mode`
- `env.dev` -> `development mode`

## Define your Data Transfer Object (DTO) types
