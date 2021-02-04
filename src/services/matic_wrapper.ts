import Matic from '@maticnetwork/maticjs';

import { sleep } from '../util/sleep';

let maticWrapper: Matic | null = null;

export const initializeMaticWrapper = async (): Promise<Matic | null> => {
    const { ethereum, web3 } = window;

    if (maticWrapper) {
        return maticWrapper;
    }

    maticWrapper = new Matic({
        network: 'mainnet',
        version: 'v1',
        maticProvider: ethereum ? ethereum : web3.currentProvider,
        parentProvider: 'https://mainnet.infura.io/v3/21cae5088ccc40b199bc7352155d7c92'
    });

    maticWrapper.initialize();

    return maticWrapper;
};

export const getWeb3Wrapper = async (): Promise<Matic> => {
    while (!maticWrapper) {
        // if web3Wrapper is not set yet, wait and retry
        await sleep(100);
    }

    return maticWrapper;
};
