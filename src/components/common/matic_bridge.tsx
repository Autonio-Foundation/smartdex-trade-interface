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

interface Props {
    theme: Theme;
}

interface State {
    isOpen: boolean;
    isDeposit: boolean;
    currentToken: string;
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

class MaticBridge extends React.Component<Props, State> {
    public state: State = {
        isOpen: false,
        isDeposit: true,
        currentToken: MATIC_BRIDGE_TOKENS[0]
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

    public render = () => {
        const { theme } = this.props;
        const { isOpen, isDeposit, currentToken } = this.state;

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
