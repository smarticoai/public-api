# Smartico Public API
API allows you to build custom Gamification UI using smartico.ai as a backend system.


```
Please contact your Smartico account manager to get the API keys
and for terms of API usage
```



## Front-end usage

To use the API you need the smartico.js library installed and initialized on your site according to this guide https://help.smartico.ai/welcome/technical-guides/front-end-integration

As soon as the **_smartico** object is available in the global context of the browser window and the user is identified, you can call API methods to get the data or act on behalf of the logged-in user.

```javascript

_smartico.api.getLevels().then( levels => {
    console.log('There are ' + levels.length + ' levels available');
});

```

Some methods can be called with onUpdate callback, which is executed when there are changes in the underlying data.
Example:

```javascript

var miniGamesUpdates = (games) => {
    console.log('There are ' + games.length + ' games available now');
}

_smartico.api.getMiniGames( { onUpdate: miniGamesUpdates} ).then( games => {
    console.log('There are ' + games.length + ' games available');
});

```

See the [API documentation](docs/classes/WSAPI.md) for all available methods and returning data.

## Visitor mode

You can also get gamification data for the visitors (not authorized users). 

Calls to the methods look similar, with the only exception that you need to use **_smartico.vapi('EN')** method to get access to the Visitor API object with a specific language.

**Note: please contact your Success Manager on the Smartico side to enable Visitor mode**

```javascript

_smartico.vapi('EN').getLevels().then( levels => {
    console.log('There are ' + levels.length + ' levels available');
});

```

## Backend usage (NodeJS context)

Note: access to the server-to-server API is not provided by default and is a topic for a separate agreement with Smartico.
We recommend using a front-end API approach in most cases.

### Installation

```bash
npm install --save @smartico/public-api
```

### Usage

```typescript
import { SmarticoAPI } from '@smartico/public-api';

const SAPI = new SmarticoAPI( 'your-label-api-key', 'your-brand-key', 'your-message-sender', { logger: console });

const userExtId = 'John1984'
            
const response = await SAPI.miniGamesGetTemplates(userExtId);

response.templates.forEach( t => {
    console.log(t.saw_template_ui_definition.name)
}

```

## Development and publishing process

### Publishing process

```sh
git commit
npm run build
npm version patch
npm run pub
```

### To debug locally

In the public-api project:

```sh
npm link
# when you are done
npm unlink
```

In the target project
```bash
npm link @smartico/public-api --legacy-peer-deps

# when you are done
npm unlink @smartico/public-api --legacy-peer-deps && npm install @smartico/public-api --legacy-peer-deps
```