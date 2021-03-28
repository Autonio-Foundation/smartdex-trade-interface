import { BigNumber } from '0x.js';
import React from 'react';
import styled, { withTheme } from 'styled-components';
import Modal from 'react-modal';
import Matic from '@maticnetwork/maticjs';
import { MaticPOSClient } from '@maticnetwork/maticjs';
import { MATIC_PROVIDER, INFURA_PROVIDER } from '../../common/constants';

import { Theme } from '../../themes/commons';
import { Dropdown, DropdownPositions } from './matic_bridge_dropdown';
import { DropdownTextItem } from './matic_bridge_text_item';
import { BigNumberInput } from './big_number_input';
import { themeDimensions } from '../../themes/commons';
import { ButtonVariant } from '../../util/types';
import { KNOWN_TOKENS_META_DATA, TokenMetaData } from '../../common/tokens_meta_data';
import { Button } from './button';
import { tokenAmountInUnits } from '../../util/tokens';

import { separatorTopbar } from './toolbar';

interface Props {
    theme: Theme;
}

interface State {
    isOpen: boolean;
    currentToken: TokenMetaData;
    amount: BigNumber;
    maticBalance: { [k: string]: any };
    ethBalance: { [k: string]: any };
    chainid: number;
    isDeposit: boolean;
}

const ModalContent = styled.div`
    align-items: center;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    flex-shrink: 0;
    max-height: 100%;
    min-height: 300px;
    overflow: auto;
    width: 420px;
    height: 480px;
    color: #fff;
`;

const DepositContent = styled.div<{ active?: boolean }>`
    align-items: center;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    flex-shrink: 0;
    min-height: 50px;
    width: 50%;
    height: 50px;
    text-align: center;
    justify-content: center;
    cursor: pointer;
    font-weight: bold;
    color: ${props => props.active ? '#ACCA27' : '#fff'};
    border-radius: 35px;
    background-color: ${props => props.active ? 'rgba(172, 202, 38, 0.1)' : 'transparent'};
`;

const FieldContainer = styled.div`
    height: ${themeDimensions.fieldHeight};
    margin-bottom: 20px;
    position: relative;
`;

const MaticBridgeLink = styled.a`
    align-items: center;
    color: ${props => props.theme.componentsTheme.myWalletLinkColor};
    display: flex;
    font-size: 16px;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;

    &:hover {
        text-decoration: underline;
    }

    &:after {
        background-color: ${props => props.theme.componentsTheme.topbarSeparatorColor};
        content: '';
        height: 26px;
        margin-left: 17px;
        margin-right: 17px;
        width: 1px;
    }
    &:last-child:after {
        display: none;
    }
`;

const BigInputNumberStyled = styled<any>(BigNumberInput)`
    background-color: ${props => props.theme.componentsTheme.textInputBackgroundColor};
    border-radius: 15px;
    border: 1px solid ${props => props.theme.componentsTheme.textInputBorderColor};
    color: ${props => props.theme.componentsTheme.textInputTextColor};
    font-feature-settings: 'tnum' 1;
    font-size: 16px;
    height: 100%;
    padding-left: 14px;
    padding-right: 60px;
    position: absolute;
    width: 100%;
`;

const TokenContainer = styled.div`
    display: flex;
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
`;

const TokenText = styled.span`
    color: ${props => props.theme.componentsTheme.textInputTextColor};
    font-size: 14px;
    font-weight: normal;
    line-height: 21px;
    text-align: right;
`;

const Content = styled.div`
    display: flex;
    flex-direction: column;
    padding: 20px ${themeDimensions.horizontalPadding};
    width: 100%;
`;

const DotDiv = styled.div`
    border-radius: 50%;
    height: 8px;
    margin-top: 4px;
    margin-right: 12px;
    width: 8px;
`;

const LabelContainer = styled.div`
    align-items: flex-end;
    display: flex;
    justify-content: space-between;
    margin: 5px 0 10px 0;
`;

const Label = styled.label<{ color?: string }>`
    color: ${props => props.color || props.theme.componentsTheme.textColorCommon};
    font-size: 14px;
    font-weight: 500;
    line-height: normal;
    margin: 0;
`;

const FeeLabel = styled(Label)`
    color: ${props => props.theme.componentsTheme.textColorCommon};
    font-weight: normal;
`;

const Row = styled.div`
    align-items: center;
    border-top: dashed 1px ${props => props.theme.componentsTheme.borderColor};
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    position: relative;
    z-index: 1;

    &:last-of-type {
        margin-bottom: 20px;
    }
`;

const Value = styled.div`
    color: ${props => props.theme.componentsTheme.textColorCommon};
    flex-shrink: 0;
    font-feature-settings: 'tnum' 1;
    font-size: 14px;
    line-height: 1.2;
    white-space: nowrap;
`;

const CostValue = styled(Value)`
    font-feature-settings: 'tnum' 1;
    font-weight: bold;
`;

const CostLabel = styled(Label)`
    font-weight: 700;
`;


const MainLabel = styled(Label)``;

const BridgeButton = styled(Button)`
    margin-right: 21px;
    height: 36px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 18px;
    line-height: 34px;
    background-color: #7C9632;
    &:hover {
        opacity: 0.65;
    }
`;

const RoundedButton = styled(Button)`
    border-radius: 16px;
    height: 50px;
`;

function TokenSymbolFormat(symbol: string) {
    return symbol === 'wmatic' ? 'MATIC' : symbol.toUpperCase()
}

class MaticBridge extends React.Component<Props, State> {
    public state: State = {
        isOpen: false,
        currentToken: KNOWN_TOKENS_META_DATA[0],
        amount: new BigNumber(0),
        chainid: 0,
        maticBalance: {},
        ethBalance: {},
        isDeposit: true
    };

    constructor(props: Props) {
        super(props);
    }

    public componentDidMount = async () => {
        try {
            let chainid = parseInt(await window.ethereum.request({ method: 'eth_chainId' }));
            console.log(chainid);
            this.setState({ chainid });
        } catch (error) {
            console.log(error);
        }
        await this.updateBalances();
    };

    public updateBalances = async () => {
        let maticWrapper: Matic;
        const { chainid } = this.state;

        try {

            if (chainid === 1) {
                maticWrapper = new Matic({
                    network: 'mainnet',
                    version: 'v1',
                    maticProvider: MATIC_PROVIDER,
                    parentProvider: window.ethereum,
                    parentDefaultOptions: { from: window.ethereum.selectedAddress },
                    maticDefaultOptions: { from: window.ethereum.selectedAddress }
                });
            }
            else {
                maticWrapper = new Matic({
                    network: 'mainnet',
                    version: 'v1',
                    maticProvider: window.ethereum,
                    parentProvider: INFURA_PROVIDER,
                    parentDefaultOptions: { from: window.ethereum.selectedAddress },
                    maticDefaultOptions: { from: window.ethereum.selectedAddress }
                });
            }

            maticWrapper.initialize();

            console.log(maticWrapper);

            let maticBalance: { [k: string]: any } = {};
            let ethBalance: { [k: string]: any } = {};

            KNOWN_TOKENS_META_DATA && KNOWN_TOKENS_META_DATA.map(async (token) => {
                let value = await maticWrapper.balanceOfERC20(
                    window.ethereum.selectedAddress,
                    token.symbol === 'wmatic' ? maticWrapper.network.Matic.Contracts.Tokens.MaticToken : token.addresses[137],
                    {
                        from: window.ethereum.selectedAddress,
                    }
                )
                maticBalance[token.symbol] = value / Math.pow(10, token.decimals);

                value = await maticWrapper.balanceOfERC20(
                    window.ethereum.selectedAddress,
                    token.symbol === 'wmatic' ? maticWrapper.network.Main.Contracts.Tokens.MaticToken : token.addresses[1],
                    {
                        from: window.ethereum.selectedAddress,
                        parent: true
                    }
                )
                ethBalance[token.symbol] = value / Math.pow(10, token.decimals);
            })

            this.setState({ maticBalance, ethBalance });
        } catch (error) {
            console.log(error);
        }
    }

    public handleOpenModal = (ev: any) => {
        ev.preventDefault();
        this.setState({ isOpen: true });
    }

    public handleCloseModel = (ev: any) => {
        ev.preventDefault();
        this.setState({ isOpen: false });
    }

    public updateAmount = (newValue: BigNumber) => {
        this.setState({
            amount: newValue,
        });
    };

    public submit = async () => {
        const { currentToken, amount, chainid } = this.state;

        if (chainid === 1) {
            if (currentToken.symbol === 'wmatic') {
                const maticWrapper = new Matic({
                    network: 'mainnet',
                    version: 'v1',
                    maticProvider: MATIC_PROVIDER,
                    parentProvider: window.ethereum,
                    parentDefaultOptions: { from: window.ethereum.selectedAddress },
                    maticDefaultOptions: { from: window.ethereum.selectedAddress }
                });
                console.log('Matic Deposit', maticWrapper.network.Main.Contracts.Tokens.MaticToken, window.ethereum.selectedAddress);
                await maticWrapper.approveERC20TokensForDeposit(
                    maticWrapper.network.Main.Contracts.Tokens.MaticToken,
                    amount.toString()
                )
                await maticWrapper.depositERC20ForUser(
                    maticWrapper.network.Main.Contracts.Tokens.MaticToken,
                    window.ethereum.selectedAddress,
                    amount.toString()
                )

            }
            else {
                const maticPoSClient = new MaticPOSClient({
                    network: 'mainnet',
                    version: 'v1',
                    maticProvider: MATIC_PROVIDER,
                    parentProvider: window.ethereum,
                    parentDefaultOptions: { from: window.ethereum.selectedAddress },
                    maticDefaultOptions: { from: window.ethereum.selectedAddress }
                });
                await maticPoSClient.approveERC20ForDeposit(
                    currentToken.addresses[1],
                    amount.toString()
                )
                await maticPoSClient.depositERC20ForUser(
                    currentToken.addresses[1],
                    window.ethereum.selectedAddress,
                    amount.toString()
                )
            }
        }
        else if (chainid === 137) {
            // if (currentToken.symbol === 'wmatic') {
            const maticWrapper = new Matic({
                network: 'mainnet',
                version: 'v1',
                maticProvider: window.ethereum,
                parentProvider: INFURA_PROVIDER,
                parentDefaultOptions: { from: window.ethereum.selectedAddress },
                maticDefaultOptions: { from: window.ethereum.selectedAddress }
            });
            console.log('Withdrawal', maticWrapper.network.Matic.Contracts.Tokens.MaticToken, window.ethereum.selectedAddress);
            let txHash = await maticWrapper.startWithdraw(
                currentToken.symbol === 'wmatic' ? maticWrapper.network.Matic.Contracts.Tokens.MaticToken : currentToken.addresses[137],
                amount.toString(), {
                from: window.ethereum.selectedAddress
            }
            );
            await maticWrapper.withdraw(
                txHash, {
                from: window.ethereum.selectedAddress
            }
            );
            // }
            // else {
            //     const maticPoSClient = new MaticPOSClient({
            //         network: 'mainnet',
            //         version: 'v1',
            //         maticProvider: window.ethereum,
            //         parentProvider: INFURA_PROVIDER,
            //         parentDefaultOptions: { from: window.ethereum.selectedAddress },
            //         maticDefaultOptions: { from: window.ethereum.selectedAddress }
            //     });    
            //     let txHash = await maticPoSClient.burnERC20(
            //         currentToken.addresses[137],
            //         amount.toString(), {
            //             from: window.ethereum.selectedAddress
            //         }
            //     );
            //     console.log('Withdrawal', txHash, window.ethereum.selectedAddress);
            //     await maticPoSClient.exitERC20(
            //         txHash, {
            //             from: window.ethereum.selectedAddress
            //         }
            //     );
            // }
        }

        await this.updateBalances();

        this.setState({ isOpen: false });
    }

    public render = () => {
        const { theme } = this.props;
        const { isOpen, currentToken, amount, maticBalance, ethBalance, chainid, isDeposit } = this.state;

        return (
            <>
                <BridgeButton
                    onClick={this.handleOpenModal}
                >
                    Deposit
                </BridgeButton>
                <Modal isOpen={isOpen} style={theme.modalTheme} onRequestClose={this.handleCloseModel}>
                    <ModalContent>
                        <div style={{ display: 'flex', width: '100%' }}>
                            <DepositContent onClick={() => this.setState({ isDeposit: true })} active={isDeposit} >Deposit</DepositContent>
                            <DepositContent onClick={() => this.setState({ isDeposit: false })} active={!isDeposit} >Withdraw</DepositContent>
                        </div>
                        <Content>
                            <div><span style={{ fontWeight: 'bold', fontSize: 18 }}>Matic Bridge</span> <span style={{ fontSize: 14, marginLeft: 4, color: '#aaa' }}>{isDeposit ? "Deposit to Matic Mainnet" : "Withdraw to Ethereum Mainnet"}</span></div>
                            <p style={{ color: 'red', marginTop: 20 }}>Warning - Do not trade using Ledger as matic network doesn’t support Ledger at the moment.</p>
                            <div style={{ display: 'flex', marginBottom: 26, marginTop: 10 }}>
                                <DotDiv style={{ backgroundColor: ((isDeposit && chainid === 1) || (!isDeposit && chainid === 137)) ? '#ACCA27' : '#E81C34' }} />
                                <span style={{ fontSize: 14 }}>{chainid === 1 ? (isDeposit ? "You are on Ethereum Mainnet" : "Switch to Matic Mainnet for withdrawal") : (!isDeposit ? "You are on Matic Mainnet" : "Switch to Ethereum Mainnet for deposit")}</span>
                            </div>

                            <Dropdown
                                body={
                                    <>
                                        {KNOWN_TOKENS_META_DATA.map((token, idx) =>
                                            <DropdownTextItem key={idx} style={{ width: '100%' }} onClick={() => this.setState({ currentToken: token })} text={TokenSymbolFormat(token.symbol)}
                                                value={isDeposit ? (ethBalance[token.symbol] ? ethBalance[token.symbol].toFixed(token.displayDecimals) : "0.00")
                                                    : (maticBalance[token.symbol] ? maticBalance[token.symbol].toFixed(token.displayDecimals) : "0.00")} />
                                        )}
                                    </>
                                }
                                header={
                                    <>
                                        &#9660; {TokenSymbolFormat(currentToken.symbol)}
                                    </>
                                }
                                horizontalPosition={DropdownPositions.Left}
                                shouldCloseDropdownOnClickOutside={true}
                            />

                            <FieldContainer>
                                <BigInputNumberStyled
                                    decimals={currentToken.decimals}
                                    min={new BigNumber(0)}
                                    onChange={this.updateAmount}
                                    value={amount}
                                    placeholder={'0.00'}
                                />
                                <TokenContainer>
                                    <TokenText>Max. {isDeposit ? (ethBalance[currentToken.symbol] ? ethBalance[currentToken.symbol].toFixed(currentToken.displayDecimals) : "0.00")
                                        : (maticBalance[currentToken.symbol] ? maticBalance[currentToken.symbol].toFixed(currentToken.displayDecimals) : "0.00")}</TokenText>
                                </TokenContainer>
                            </FieldContainer>

                            <LabelContainer>
                                <MainLabel>Details</MainLabel>
                            </LabelContainer>
                            <Row>
                                <FeeLabel>Amount</FeeLabel>
                                <Value>{tokenAmountInUnits(amount, currentToken.decimals)} {TokenSymbolFormat(currentToken.symbol)}</Value>
                            </Row>

                            <RoundedButton
                                disabled={amount.isZero() || (isDeposit && chainid !== 1) || (!isDeposit)}
                                // disabled={amount.isZero() || (isDeposit && chainid !== 1) || (!isDeposit && chainid !== 137)}
                                // disabled={true}
                                variant={isDeposit ? ButtonVariant.Buy : ButtonVariant.Sell}
                                style={{ backgroundColor: '#ACCA27', textTransform: 'capitalize' }}
                                onClick={this.submit}
                            >
                                {isDeposit ? "Deposit" : "Withdraw"}
                            </RoundedButton>
                        </Content>
                    </ModalContent>
                </Modal>
            </>
        );
    };

}

const MaticBridgeContainer = withTheme(
    MaticBridge,
);

export { MaticBridgeContainer };
