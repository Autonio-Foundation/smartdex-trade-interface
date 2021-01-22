import React from 'react';
import { connect } from 'react-redux';
import ReactSVG from 'react-svg';
import styled, { withTheme } from 'styled-components';

import { ReactComponent as LogoSvg } from '../../../assets/icons/erc20_logo.svg';
import { Config } from '../../../common/config';
import { UI_GENERAL_TITLE, ARKANE_CLIENTID, ARKANE_ENV, ARKANE_REDIRECT_URI } from '../../../common/constants';
import { Logo } from '../../../components/common/logo';
import { separatorTopbar, ToolbarContainer } from '../../../components/common/toolbar';
import { NotificationsDropdownContainer } from '../../../components/notifications/notifications_dropdown';
import { goToHome, goToWallet } from '../../../store/actions';
import { Theme, themeBreakPoints } from '../../../themes/commons';
import { Button } from '../../common/button';
import { WalletConnectionContentContainer } from '../account/wallet_connection_content';
import { ArkaneConnect } from '@arkane-network/arkane-connect';

import { MarketsDropdownContainer } from './markets_dropdown';

interface DispatchProps {
    onGoToHome: () => any;
    onGoToWallet: () => any;
}

interface OwnProps {
    theme: Theme;
}

type Props = DispatchProps & OwnProps;

const ArkaneConnectLink = styled.a`
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

const MyWalletLink = styled.a`
    align-items: center;
    color: ${props => props.theme.componentsTheme.myWalletLinkColor};
    display: flex;
    font-size: 16px;
    font-weight: 500;
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }

    ${separatorTopbar}
`;

const LogoHeader = styled(Logo)`
    ${separatorTopbar}
`;

const LogoSVGStyled = styled(LogoSvg)`
    path {
        fill: ${props => props.theme.componentsTheme.logoERC20Color};
    }
`;

const MarketsDropdownHeader = styled<any>(MarketsDropdownContainer)`
    align-items: center;
    display: flex;

    ${separatorTopbar}
`;

const WalletDropdown = styled(WalletConnectionContentContainer)`
    display: none;

    @media (min-width: ${themeBreakPoints.sm}) {
        align-items: center;
        display: flex;

        ${separatorTopbar}
    }
`;

interface State {
    isArkaneAuthenticated: Boolean;
}

class ToolbarContent extends React.Component<Props, State> {

    public readonly state: State = {
        isArkaneAuthenticated: false
    }

    public componentDidMount = async () => {
        window.arkaneConnect = new ArkaneConnect(ARKANE_CLIENTID, {chains: ['Ethereum'], environment: ARKANE_ENV});
        if (window.arkaneConnect) {
            window.arkaneConnect.checkAuthenticated()
                .then((result: any) => result.authenticated((auth: any) => {
                        console.log('Authentication successfull ' + auth.subject);
                        this.setState({isArkaneAuthenticated: true});
                    })
                    .notAuthenticated((auth: any) => {
                        console.log('Not authenticated');
                    })
                );
        }
    }

    private readonly handleLogoClick = (e: any) => {
        e.preventDefault();
        this.props.onGoToHome();
    };

    private readonly handleMyWalletClick = (e: any) => {
        e.preventDefault();
        this.props.onGoToWallet();
    };

    private readonly handleArkaneConnect = (e: any) => {
        const { isArkaneAuthenticated } = this.state;
        e.preventDefault();
        if (window.arkaneConnect) {
            if (!isArkaneAuthenticated) {
                window.arkaneConnect.authenticate({windowMode: 'POPUP', redirectUri: ARKANE_REDIRECT_URI})
                    .then((result: any) => result.authenticated((auth: any) => {
                            console.log('Authentication successfull ' + auth.subject);
                            this.setState({isArkaneAuthenticated: true});
                        })
                        .notAuthenticated((auth: any) => {
                            console.log('Not authenticated');
                            this.setState({isArkaneAuthenticated: false});
                        })
                    );
            }
            else {
                window.arkaneConnect.logout();
            }
        }
    }

    public render() {
        const generalConfig = Config.getConfig().general;
        const { isArkaneAuthenticated } = this.state;
        // const logo = <LogoSVGStyled />;
        const logo = null;
        const startContent = (
            <>
                <LogoHeader
                    image={logo}
                    onClick={this.handleLogoClick}
                    text="smartdex"
                    textColor={this.props.theme.componentsTheme.logoERC20TextColor}
                />
                <MarketsDropdownHeader shouldCloseDropdownBodyOnClick={false} />
            </>
        );
    
        const endContent = (
            <>
                <ArkaneConnectLink onClick={this.handleArkaneConnect}>{isArkaneAuthenticated ? 'Arkane Logout' : 'Connect to Arkane'}</ArkaneConnectLink>
                <MyWalletLink href="/my-wallet" onClick={this.handleMyWalletClick}>
                    My Wallet
                </MyWalletLink>
                <WalletDropdown />
                <NotificationsDropdownContainer />
            </>
        );
    
        return <ToolbarContainer startContent={startContent} endContent={endContent} />;    
    }
};

const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return {
        onGoToHome: () => dispatch(goToHome()),
        onGoToWallet: () => dispatch(goToWallet()),
    };
};

const ToolbarContentContainer = withTheme(
    connect(
        null,
        mapDispatchToProps,
    )(ToolbarContent),
);

export { ToolbarContent, ToolbarContentContainer };
