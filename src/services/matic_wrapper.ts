import Matic from '@maticnetwork/maticjs';
import { MaticPOSClient } from '@maticnetwork/maticjs';
import MetamaskProvider from "@maticnetwork/metamask-provider"
import { MATIC_PROVIDER, INFURA_PROVIDER } from '../common/constants';

import { sleep } from '../util/sleep';

// const MaticPOSClient = require('@maticnetwork/maticjs').MaticPOSClient

let maticWrapper: Matic | null = null;
let maticPoSClient : MaticPOSClient | null = null;

export const initializeMaticWrapper = async (): Promise<Matic | null> => {
    const { ethereum, web3 } = window;

    if (maticWrapper) {
        return maticWrapper;
    }

    const ethereumProvider = new MetamaskProvider(ethereum, {
        url: INFURA_PROVIDER
    })

    const maticProvider = new MetamaskProvider(ethereum, {
        url: MATIC_PROVIDER
    })

    maticWrapper = new Matic({
        network: 'mainnet',
        version: 'v1',
        maticProvider: maticProvider,
        parentProvider: ethereumProvider
    });

    maticWrapper.initialize();

    maticPoSClient = new MaticPOSClient({
        network: 'mainnet',
        version: 'v1',
        maticProvider: maticProvider,
        parentProvider: ethereumProvider
    });

    return maticWrapper;
};

export const getMaticWrapper = async (): Promise<Matic> => {
    while (!maticWrapper) {
        // if web3Wrapper is not set yet, wait and retry
        await sleep(100);
    }

    return maticWrapper;
};

export const getMaticPOSClient = async (): Promise<MaticPOSClient> => {
    while (!maticPoSClient) {
        // if web3Wrapper is not set yet, wait and retry
        await sleep(100);
    }

    return maticPoSClient;
};
