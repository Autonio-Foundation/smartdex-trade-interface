import { MaticPOSClient } from '@maticnetwork/maticjs';
import { INFURA_PROVIDER } from '../common/constants';

import { sleep } from '../util/sleep';

// const MaticPOSClient = require('@maticnetwork/maticjs').MaticPOSClient

let maticWrapper: MaticPOSClient | null = null;

export const initializeMaticWrapper = async (): Promise<MaticPOSClient | null> => {
    const { ethereum, web3 } = window;

    if (maticWrapper) {
        return maticWrapper;
    }

    maticWrapper = new MaticPOSClient({
        network: 'mainnet',
        version: 'v1',
        maticProvider: ethereum ? ethereum : web3.currentProvider,
        parentProvider: INFURA_PROVIDER
    });

    return maticWrapper;
};

export const getWeb3Wrapper = async (): Promise<MaticPOSClient> => {
    while (!maticWrapper) {
        // if web3Wrapper is not set yet, wait and retry
        await sleep(100);
    }

    return maticWrapper;
};
