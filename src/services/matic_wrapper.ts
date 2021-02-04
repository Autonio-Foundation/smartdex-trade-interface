import Matic from '@maticnetwork/maticjs';
import { INFURA_PROVIDER } from '../common/constants';

import { sleep } from '../util/sleep';

let maticWrapper: Matic.MaticPOSClient | null = null;

export const initializeMaticWrapper = async (): Promise<Matic.MaticPOSClient | null> => {
    const { ethereum, web3 } = window;

    if (maticWrapper) {
        return maticWrapper;
    }

    maticWrapper = new Matic.MaticPOSClient({
        network: 'mainnet',
        version: 'v1',
        maticProvider: ethereum ? ethereum : web3.currentProvider,
        parentProvider: INFURA_PROVIDER
    });

    maticWrapper.initialize();

    return maticWrapper;
};

export const getWeb3Wrapper = async (): Promise<Matic.MaticPOSClient> => {
    while (!maticWrapper) {
        // if web3Wrapper is not set yet, wait and retry
        await sleep(100);
    }

    return maticWrapper;
};
