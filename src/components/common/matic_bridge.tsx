import { BigNumber } from '0x.js';
import React from 'react';
import styled, { withTheme } from 'styled-components';
import { separatorTopbar } from '../../components/common/toolbar';
import Modal from 'react-modal';

import { Theme } from '../../themes/commons';
import { CloseModalButton } from './icons/close_modal_button';
import { ModalContent, Title, ModalText } from './steps_modal/steps_common';
import { Dropdown, DropdownPositions } from './dropdown';
import { DropdownTextItem } from './dropdown_text_item';
import { BigNumberInput } from './big_number_input';
import { getKnownTokens } from '../../util/known_tokens';
import { themeDimensions } from '../../themes/commons';
import { getWeb3Wrapper } from '../../services/matic_wrapper';
import { Token } from '../../util/types';
import { KNOWN_TOKENS_META_DATA, TokenMetaData } from '../../common/tokens_meta_data';
import { Button } from './button';

interface Props {
    theme: Theme;
}

interface State {
    isOpen: boolean;
    isDeposit: boolean;
    currentToken: TokenMetaData;
    amount: BigNumber;
    maticBalance: {[k: string]: any};
    ethBalance: {[k: string]: any};
}

const DepositContent = styled.div`
    align-items: center;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    flex-shrink: 0;
    min-height: 70px;
    width: 140px;
    height: 70px;
    border: 2px solid #fff;
    border-radius: 6px;
    margin: 4px;
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

    ${separatorTopbar}
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

class MaticBridge extends React.Component<Props, State> {
    public state: State = {
        isOpen: false,
        isDeposit: true,
        currentToken: KNOWN_TOKENS_META_DATA[0],
        amount: new BigNumber(0),
        maticBalance: {},
        ethBalance: {}
    };

    constructor(props: Props) {
        super(props);
    }

    public componentDidMount = async () => {
        const maticWrapper = await getWeb3Wrapper();
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
            maticBalance[token.symbol] = value / token.decimals;
    
            value = await maticWrapper.balanceOfERC20(
                window.ethereum.selectedAddress,
                token.addresses[1],
                {
                    from: window.ethereum.selectedAddress,
                    parent: true
                }
            )
            ethBalance[token.symbol] = value / token.decimals;
        })

        this.setState({maticBalance, ethBalance});
    };

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

    public render = () => {
        const { theme } = this.props;
        const { isOpen, isDeposit, currentToken, amount, maticBalance, ethBalance } = this.state;

        return (
            <>
                <MaticBridgeLink onClick={this.handleOpenModal}>
                    Matic Bridge
                </MaticBridgeLink>
                <Modal isOpen={isOpen} style={theme.modalTheme}>
                    <CloseModalButton onClick={this.handleCloseModel} />
                    <ModalContent style={{color: '#fff'}}>
                        <Title>Matic Bridge</Title>
                        <div style={{display: 'flex'}}>
                            <DepositContent style={{borderColor: isDeposit ? '#0FEE90' : '#fff', color: isDeposit ? '#0FEE90' : '#fff'}} 
                                onClick={() => this.setState({isDeposit: true})}>Deposit to Matic</DepositContent>
                            <DepositContent style={{borderColor: !isDeposit ? '#0FEE90' : '#fff', color: !isDeposit ? '#0FEE90' : '#fff'}} 
                                onClick={() => this.setState({isDeposit: false})}>Withdraw to Ethereum</DepositContent>
                        </div>

                        <Content>
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
                                                    <DropdownTextItem key={idx} onClick={() => this.setState({currentToken: token})} text={token.symbol === 'wmatic' ? 'MATIC' : token.symbol.toUpperCase()} />
                                                )}
                                                </>
                                            }
                                            header={
                                                <>
                                                    {currentToken.symbol === 'wmatic' ? 'MATIC' : currentToken.symbol.toUpperCase()}
                                                </>
                                            }
                                            horizontalPosition={DropdownPositions.Right}
                                            shouldCloseDropdownOnClickOutside={true}
                                        />
                                    </TokenText>
                                </TokenContainer>
                            </FieldContainer>

                            <p>Max Amount: {isDeposit ? ethBalance[currentToken.symbol] && ethBalance[currentToken.symbol].toFixed(currentToken.displayDecimals)
                             : maticBalance[currentToken.symbol] && maticBalance[currentToken.symbol].toFixed(currentToken.displayDecimals)}</p>

                            <Button
                                disabled={amount.isZero()}
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
