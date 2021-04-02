import React, { HTMLAttributes } from 'react';
import styled from 'styled-components';

import { themeDimensions } from '../../themes/commons';

interface OwnProps extends HTMLAttributes<HTMLButtonElement> {
    fontSize?: FontSize;
}

interface ButtonProps {
    fontSize?: FontSize;
    textAlign?: string;
}

type Props = OwnProps;

export enum FontSize {
    Large = 1,
    Medium = 2,
}

const SwitchButton = styled.button<ButtonProps>`
    align-items: center;
    border-radius: 12px;
    background-color: rgba(172,202,39, 0.2);
    border: 1px solid rgba(172,202,39, 0.05);
    color: #ACCA27;
    height: 36px;
    display: flex;
    font-weight: 600;
    font-size: 16px;
    line-height: 34px;
    padding: 10px 15px;
    ${props => (props.textAlign === 'center' ? 'justify-content: center;' : '')}
    cursor: pointer;
    &:hover {
       background-color: rgba(172,202,39, 0.1);
       border: 1px solid rgba(172,202,39, 0.5);
    }

    &:active {
        opacity: 0.8;
    }

    &:focus {
        outline: none;
    }

    &:disabled {
        cursor: default;
        opacity: 0.5;
    }
`;

const NetworkSwitchButton: React.FC<Props> = props => {

    const onSwitchNetwork = async () => {
        const { ethereum } = window;

        if (!ethereum) {
            return;
        }

        try {
            const maticNetworkInfo = {
                chainId: '0x89',
                chainName: 'Matic Network',
                rpcUrls: ['https://rpc-mainnet.maticvigil.com/'],
                iconUrls: [
                    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0/logo.png'
                ],
                blockExplorerUrls: [
                    'https://explorer-mainnet.maticvigil.com/'
                ],
                nativeCurrency: {
                    'name': 'Matic Token',
                    'symbol': 'MATIC',
                    'decimals': 18,
                }
            }

            await ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    ...maticNetworkInfo,
                }],
            });
        } catch (error) {
            console.log('error--->', error);
        };
    };

    const { ...restProps } = props;

    return (
        <SwitchButton {...restProps} onClick={onSwitchNetwork}>
            Switch to Matic
        </SwitchButton>
    );
};

export { NetworkSwitchButton };
