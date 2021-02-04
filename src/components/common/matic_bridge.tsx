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
import { MATIC_BRIDGE_TOKENS } from '../../common/constants';
import { BigNumberInput } from './big_number_input';
import { getKnownTokens } from '../../util/known_tokens';
import { tokenSymbolToDisplayString } from '../../util/tokens';
import { themeDimensions } from '../../themes/commons';

interface Props {
    theme: Theme;
}

interface State {
    isOpen: boolean;
    isDeposit: boolean;
    currentToken: string;
    amount: BigNumber;
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

const BigInputNumberTokenLabel = (props: { tokenSymbol: string }) => (
    <TokenContainer>
        <TokenText>{tokenSymbolToDisplayString(props.tokenSymbol)}</TokenText>
    </TokenContainer>
);

class MaticBridge extends React.Component<Props, State> {
    public state: State = {
        isOpen: false,
        isDeposit: true,
        currentToken: MATIC_BRIDGE_TOKENS[0],
        amount: null
    };

    constructor(props: Props) {
        super(props);
    }

    public componentDidMount = async () => {
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
        const { isOpen, isDeposit, currentToken, amount } = this.state;

        const decimals = getKnownTokens().getTokenBySymbol(currentToken).decimals;

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

                        <Dropdown
                            style={{
                                padding: 4,
                                marginTop: 20,
                                width: 288,
                                borderBottom: '1px solid'
                            }}
                            body={
                                <>
                                {MATIC_BRIDGE_TOKENS.map((token) =>
                                    <DropdownTextItem onClick={() => this.setState({currentToken: token})} text={token.toUpperCase()} />
                                )}
                                </>
                            }
                            header={
                                <>
                                    {currentToken.toUpperCase()}
                                </>
                            }
                            horizontalPosition={DropdownPositions.Left}
                            shouldCloseDropdownOnClickOutside={true}
                        />

                        <FieldContainer>
                            <BigInputNumberStyled
                                decimals={decimals}
                                min={new BigNumber(0)}
                                onChange={this.updateAmount}
                                value={amount}
                                placeholder={'0.00'}
                            />
                            <BigInputNumberTokenLabel tokenSymbol={currentToken} />
                        </FieldContainer>

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
