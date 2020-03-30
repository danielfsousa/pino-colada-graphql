# pino-colada-graphql 🍹

(WIP) A fork of [pino-colada](https://github.com/lrlna/pino-colada) to include graphql logging.

![pino-colada-graphql](https://user-images.githubusercontent.com/11372312/77870829-cea62d00-7218-11ea-953b-bdac3093c5ef.png)

## Install
This project is not yet finished. It will be available to install with npm:

```bash
npm install pino-colada-graphql
```

## Usage

#### Piping

It's recommended to use `pino-colada-graphql` with pino by piping your server output to it:

```bash
node server.js | pino-colada-graphql
```

#### Programatically
```javascript
const pino = require('pino')
const logger = pino({
  prettifier: require('pino-colada-graphql')
})

logger.info('hi')
```

## License
[MIT](https://tldrlegal.com/license/mit-license)
