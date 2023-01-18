# The library for communication with Smartico API
- Allows to make requests and receive a response over https
- Describes data types

# Install in your application

```bash
npm install --save @smartico/public-api
```

## Usage

```typescript
import { ProtocolRequest, GBaseRequest } from '@smartico/public-api';

class Example {
  
    private static buildMessage<TRequest,TResponse>(rq: GBaseRequest): TResponse {

        const message: ProtocolRequest = {
            api_key: rq.label_api_key,
            brand_key: rq.brand_key,
            ext_user_id: rq.smartico_ext_user_id,
            uuid: Util.uuid(),
            ts: new Date().getTime(),
        };

        return message as any
    }

}
```

## Pre-requisite for publish new version of package

### Set new package version

```sh
npm run build
npm version [<newversion> | major | minor | patch ]
```

### Manual publish new version

```sh
npm run pub
```

# Developing & debugging locally

### Enable Debug changes locally

(reference article: https://terodox.tech/using-npm-link-for-package-development/)

In the public-api project console:

1. Assure you are in the project folder (`cd <your-local-git-folder-for-this-project>/public-api `)
2. Run:
    ```sh
    npm link
    ```
   This will create a symlink from the global `node_modules/@smartico/public-api` to your current folder - `<your-local-git-folder-for-this-project>/public-api`

Consumer project console:
```bash
npm link @smartico/public-api
```

Now you are ready to debug locally the library!

### Before you deploy !!! Cleanup if you enabled the debug changes locally steps above
```bash
npm unlink npm link @smartico/public-api
npm install npm link @smartico/public-api
```
