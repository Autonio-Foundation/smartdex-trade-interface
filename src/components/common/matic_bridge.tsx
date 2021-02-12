import { BigNumber } from '0x.js';
import React from 'react';
import styled, { withTheme } from 'styled-components';
import Modal from 'react-modal';
import Matic from '@maticnetwork/maticjs';
import { MaticPOSClient } from '@maticnetwork/maticjs';
import { MATIC_PROVIDER, INFURA_PROVIDER } from '../../common/constants';

import { Theme } from '../../themes/commons';
import { CloseModalButton } from './icons/close_modal_button';
import { ModalContent, Title, ModalText } from './steps_modal/steps_common';
import { Dropdown, DropdownPositions } from './dropdown';
import { DropdownTextItem } from './dropdown_text_item';
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
    maticBalance: {[k: string]: any};
    ethBalance: {[k: string]: any};
    chainid: number;
    isDeposit: boolean;
}

const DepositContent = styled.div`
    align-items: center;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    flex-shrink: 0;
    min-height: 70px;
    width: 50%;
    height: 70px;
    text-align: center;
    justify-content: center;
    cursor: pointer;
`;

const FieldContainer = styled.div`
    height: ${themeDimensions.fieldHeight};
    margin-bottom: 25px;
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
    border-radius: ${themeDimensions.borderRadius};
    border: 1px solid ${props => props.theme.componentsTheme.textInputBorderColor};
    color: ${props => props.theme.componentsTheme.textInputTextColor};
    font-feature-settings: 'tnum' 1;
    font-size: 16px;
    height: 100%;
    padding-left: 14px;
    padding-right: 60px;
    position: absolute;
    width: 100%;
    z-index: 1;
`;

const TokenContainer = styled.div`
    display: flex;
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 12;
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
        let maticWrapper : Matic;
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
    
            let maticBalance : {[k: string]: any} = {};
            let ethBalance : {[k: string]: any} = {};
    
            KNOWN_TOKENS_META_DATA && KNOWN_TOKENS_META_DATA.map(async (token) => {
                let value = await maticWrapper.balanceOfERC20(
                    window.ethereum.selectedAddress,
                    token.addresses[137],
                    {
                        from: window.ethereum.selectedAddress,
                    }
                )
                maticBalance[token.symbol] = value / Math.pow(10, token.decimals);
        
                value = await maticWrapper.balanceOfERC20(
                    window.ethereum.selectedAddress,
                    token.addresses[1],
                    {
                        from: window.ethereum.selectedAddress,
                        parent: true
                    }
                )
                ethBalance[token.symbol] = value / Math.pow(10, token.decimals);
            })
    
            this.setState({maticBalance, ethBalance});
        } catch (error) {
            console.log(error);
        }
    }

    public handleOpenModal = (ev: any) => {
        ev.preventDefault();
        this.setState({isOpen: true});
    }

    public handleCloseModel = (ev: any) => {
        ev.preventDefault();
        this.setState({isOpen: false});
    }

    public updateAmount = (newValue: BigNumber) => {
        this.setState({
            amount: newValue,
        });
    };

    public submit = async () => {
        const { currentToken, amount, chainid } = this.state;

        if (chainid === 1) {
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
        else if (chainid === 137) {
            const maticPoSClient = new MaticPOSClient({
                network: 'mainnet',
                version: 'v1',
                maticProvider: window.ethereum,
                parentProvider: INFURA_PROVIDER,
                parentDefaultOptions: { from: window.ethereum.selectedAddress },
                maticDefaultOptions: { from: window.ethereum.selectedAddress }
            });    
            let txHash = await maticPoSClient.burnERC20(
                currentToken.addresses[137],
                amount.toString()
            )
            await maticPoSClient.exitERC20(
                txHash
            )
        }

        await this.updateBalances();

        this.setState({isOpen: false});
    }

    public render = () => {
        const { theme } = this.props;
        const { isOpen, currentToken, amount, maticBalance, ethBalance, chainid, isDeposit } = this.state;

        return (
            <>
                <MaticBridgeLink href="/" onClick={this.handleOpenModal}>
                    Matic Bridge
                </MaticBridgeLink>
                <Modal isOpen={isOpen} style={theme.modalTheme}>
                    <CloseModalButton onClick={this.handleCloseModel} />
                    <ModalContent style={{color: '#fff', height: 450}}>
                        <div style={{display: 'flex', width: '100%'}}>
                            <DepositContent onClick={() => this.setState({isDeposit: true})} style={{color: isDeposit ? '#0FEE90' : '#fff', fontWeight: 'bold'}}>Deposit</DepositContent>
                            <DepositContent onClick={() => this.setState({isDeposit: false})} style={{color: !isDeposit ? '#F91A4F' : '#fff', fontWeight: 'bold'}}>Withdraw</DepositContent>
                        </div>
                        <Content>
                            <div><span style={{fontWeight: 'bold'}}>Matic Bridge</span> <span style={{fontSize: 11, marginLeft: 4, color: isDeposit ? '#0FEE90' : '#F91A4F'}}>{isDeposit ? "Deposit to Matic Mainnet" : "Withdraw to Ethereum Mainnet"}</span></div>
                            <div style={{display: 'flex', marginBottom: 26, marginTop: 20}}>
                                <DotDiv style={{backgroundColor: ((isDeposit && chainid === 1) || (!isDeposit && chainid === 137)) ? '#0FEE90' : '#F91A4F'}} />
                                <span style={{frontSize: 14}}>{chainid === 1 ? (isDeposit ? "You are on Ethereum Mainnet" : "Switch to Ethereum Mainnet for deposit") : (!isDeposit ? "You are on Matic Mainnet" : "Switch to Matic Mainnet for withdrawal") }</span>
                            </div>
                            <FieldContainer>
                                <BigInputNumberStyled
                                    decimals={currentToken.decimals}
                                    min={new BigNumber(0)}
                                    onChange={this.updateAmount}
                                    value={amount}
                                    placeholder={'0.00'}
                                />
                                <TokenContainer>
                                    <TokenText>
                                        <Dropdown
                                            style={{
                                                width: 120
                                            }}
                                            body={
                                                <>
                                                {KNOWN_TOKENS_META_DATA.map((token, idx) =>
                                                    <DropdownTextItem key={idx} onClick={() => this.setState({currentToken: token})} text={TokenSymbolFormat(token.symbol)} />
                                                )}
                                                </>
                                            }
                                            header={
                                                <>
                                                    {TokenSymbolFormat(currentToken.symbol)}
                                                </>
                                            }
                                            horizontalPosition={DropdownPositions.Right}
                                            shouldCloseDropdownOnClickOutside={true}
                                        />
                                    </TokenText>
                                </TokenContainer>
                            </FieldContainer>

                            <div style={{marginBottom: 20}}>Max. {isDeposit ? (ethBalance[currentToken.symbol] ? ethBalance[currentToken.symbol].toFixed(currentToken.displayDecimals) : "0.00")
                             : (maticBalance[currentToken.symbol] ? maticBalance[currentToken.symbol].toFixed(currentToken.displayDecimals) : "0.00")} {TokenSymbolFormat(currentToken.symbol)}</div>

                            <LabelContainer>
                                <MainLabel>Details</MainLabel>
                            </LabelContainer>
                            <Row>
                                <FeeLabel>Amount</FeeLabel>
                                <Value>{tokenAmountInUnits(amount, currentToken.decimals)} {TokenSymbolFormat(currentToken.symbol)}</Value>
                            </Row>

                            <Button
                                disabled={amount.isZero() || (isDeposit && chainid !== 1) || (!isDeposit && chainid !== 137)}
                                variant={isDeposit ? ButtonVariant.Buy : ButtonVariant.Sell}
                                onClick={this.submit}
                            >
                                {isDeposit ? "DEPOSIT" : "WITHDRAW"}
                            </Button>
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
