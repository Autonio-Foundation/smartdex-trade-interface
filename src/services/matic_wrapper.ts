import Matic from '@maticnetwork/maticjs';
import { MaticPOSClient } from '@maticnetwork/maticjs';
import { INFURA_PROVIDER } from '../common/constants';

import { sleep } from '../util/sleep';

// const MaticPOSClient = require('@maticnetwork/maticjs').MaticPOSClient

let maticWrapper: Matic | null = null;
let maticPoSClient : MaticPOSClient | null = null;

export const initializeMaticWrapper = async (): Promise<Matic | null> => {
    const { ethereum, web3 } = window;

    if (maticWrapper) {
        return maticWrapper;
    }

    maticWrapper = new Matic({
        network: 'mainnet',
        version: 'v1',
        maticProvider: ethereum ? ethereum : web3.currentProvider,
        parentProvider: INFURA_PROVIDER
    });

    maticWrapper.initialize();

    maticPoSClient = new Matic({
        network: 'mainnet',
        version: 'v1',
        maticProvider: ethereum ? ethereum : web3.currentProvider,
        parentProvider: INFURA_PROVIDER
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
