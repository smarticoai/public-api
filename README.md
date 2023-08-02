# Smartico Public API
API allows you to build and manage Smartico Gamification context on behalf of the user. It can be used in the JS/TS based frontend or in NodeJS backend

# Installation

```bash
npm install --save @smartico/public-api
```

## Usage

```typescript
import { SmarticoAPI } from '@smartico/public-api';

const SAPI = new SmarticoAPI( 'your-label-api-key', 'your-brand-key', 'your-message-sender', { logger: console });
            
const response = await SAPI.miniGamesGetTemplates(rsUser.user_ext_id);

response.templates.forEach( t => {
    console.log(t.saw_template_ui_definition.name)
}

```

## API 
### To learn more about the capabilities of our API, go to the [API documentation](docs_test/modules.md)


## Development and publishing process

### Publishing process

```sh
git commit
npm run build
npm version patch
npm run pub
```

###  Debug locally

In the public-api project console:

```sh
npm link
# when you are done
npm unlink
```

Consumer project console:
```bash
npm link @smartico/public-api --legacy-peer-deps

# when you are done
npm unlink @smartico/public-api --legacy-peer-deps && npm install @smartico/public-api --legacy-peer-deps
```