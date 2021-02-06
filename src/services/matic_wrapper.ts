import Matic from '@maticnetwork/maticjs';
import { MATIC_PROVIDER, INFURA_PROVIDER } from '../common/constants';

import { sleep } from '../util/sleep';

// const MaticPOSClient = require('@maticnetwork/maticjs').MaticPOSClient

let maticWrapper: Matic | null = null;

export const initializeMaticWrapper = async (): Promise<Matic | null> => {
    const { ethereum, web3 } = window;

    if (maticWrapper) {
        return maticWrapper;
    }

    maticWrapper = new Matic({
        network: 'mainnet',
        version: 'v1',
        maticProvider: ethereum,
        parentProvider: INFURA_PROVIDER
    });

    maticWrapper.initialize();

    return maticWrapper;
};

export const getMaticWrapper = async (): Promise<Matic> => {
    while (!maticWrapper) {
        // if web3Wrapper is not set yet, wait and retry
        await sleep(100);
    }

    return maticWrapper;
};
