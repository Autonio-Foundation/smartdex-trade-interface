# Autonio Smartdex Frontend

This repository is forked from [0x-launch-kit-frontend](https://github.com/0xProject/0x-launch-kit-frontend)

This is a frontend of Autonio Smartdex built in React.js, deployed on matic network.

## Usage

Clone this repository and install its dependencies:

```
git clone https://gitlab.com/autonio/smartdex-front-end

```

### Using an existing relayer

If you have the URL of an existing relayer, you can use this frontend against it. After installing the dependencies, start the application with this command, replacing `RELAYER_URL` with the proper value:

```
REACT_APP_RELAYER_URL='https://RELAYER_URL/api/v2' yarn start
```

A browser tab will open in the `http://localhost:3001` address. You'll need to connect MetaMask to the network used by the relayer.

You can optionally pass in any relayer endpoint that complies with the [0x Standard Relayer API](https://github.com/0xProject/standard-relayer-api). For example, you can use the [Autonio Smartdex Backend's](https://gitlab.com/autonio/smartdex-backend) [Production URL](http://3.16.219.40:3000/v2)

```
REACT_APP_RELAYER_URL='http://3.16.219.40:3000/v2' REACT_APP_NETWORK_ID=137 yarn start
```

These commands start the app in development mode. You can run `yarn build` to build the assets. The results will be in the `build` directory. Remember to set the environment variable with the relayer URL when running the `build` command:

```
REACT_APP_RELAYER_URL='https://RELAYER_URL/api/v2' yarn build
serve ./build
```

### Creating a relayer for development

If you don't have a relayer, you can start one locally for development. First create a `docker-compose.yml` file like this:

```yml
version: '3'
services:
    ganache:
        image: fvictorio/0x-ganache-testing:0.0.1
        ports:
            - '8545:8545'
    launch-kit:
        image: fvictorio/0x-launch-kit-testing
        environment:
            HTTP_PORT: '3000'
            RPC_URL: 'http://ganache:8545'
            NETWORK_ID: '50'
        ports:
            - '3000:3000'
        depends_on:
            - ganache
```

and then run `docker-compose up`. This will create two containers: one has a ganache with the smartdex contracts deployed and some test tokens, and the other one has an instance of the [launch kit](https://github.com/0xProject/0x-launch-kit) implementation of a relayer that connects to that ganache.

After starting those containers, you can run `yarn start` in another terminal. A browser tab will open in the `http://localhost:3001` address. You'll need to connect MetaMask to `localhost:8545`.

> _Note: the state of the relayer will be kept between runs. If you want to start from scratch, use `docker-compose up --force-recreate`_

## Environment variables

You can create a `.env` file to set environment variables and configure the behavior of the dApp. Start by copying the example file (`cp .env.example .env`) and modify the ones you want. Some things you can configure are:

-   `REACT_APP_RELAYER_URL`: The URL of the relayer used by the dApp. Defaults to `http://localhost:3001/api/v2`

Check `.env.example` for the full list.

### Using custom themes

If you want to add your own theme for the app, please read the [THEMES.md](THEMES.md) file

## Production URL

http://dex.smartdex.app