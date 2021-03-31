import React from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import styled, { withTheme } from 'styled-components';

import Logo from '../../../assets/images/logo.svg';
import { separatorTopbar, ToolbarContainer } from '../../../components/common/toolbar';
import { NotificationsDropdownContainer } from '../../../components/notifications/notifications_dropdown';
import { goToHome, goToWallet } from '../../../store/actions';
import { Theme, themeBreakPoints } from '../../../themes/commons';
import { ExternalLink } from '../../../themes/components';
import { MaticBridgeContainer } from '../../common/matic_bridge';
import { Row, RowFixed } from '../../common/row';
import { WalletConnectionContentContainer } from '../account/wallet_connection_content';

const activeClassName = 'ACTIVE';

interface DispatchProps {
    onGoToHome: () => any;
    onGoToWallet: () => any;
}

interface OwnProps {
    theme: Theme;
}

type Props = DispatchProps & OwnProps;

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

const WalletDropdown = styled(WalletConnectionContentContainer)`
    display: none;
    @media (min-width: ${themeBreakPoints.sm}) {
        align-items: center;
        display: flex;
        ${separatorTopbar}
    }
`;

const HeaderRow = styled(RowFixed)`
    @media (max-width: ${themeBreakPoints.md}) {
        width: 100%;
    }
`;

const Title = styled.a`
    display: flex;
    align-items: center;
    pointer-events: auto;
    justify-self: flex-start;
    margin-right: 12px;
    @media (max-width: ${themeBreakPoints.sm}) {
        justify-self: center;
    };
    :hover {
        cursor: pointer;
    }
`;

const UniIcon = styled.div`
  transition: transform 0.3s ease;
  :hover {
    transform: rotate(-5deg);
  }
`;

const HeaderLinks = styled(Row)`
    justify-content: center;
    @media (max-width: ${themeBreakPoints.md}) {
        padding: 1rem 0 1rem 1rem;
        justify-content: flex-end;
    };
`;

const StyledNavLink = styled(NavLink).attrs({
    activeClassName,
})`
    display: flex;
    flex-flow: row nowrap;
    align-items: left;
    border-radius: 3rem;
    outline: none;
    cursor: pointer;
    text-decoration: none;
    font-size: 18px;
    font-weight: 600;
    line-height: 34px;
    width: fit-content;
    margin: 0 12px;
    font-weight: 500;
    color: #ffffff;
    word-break: keep-all;

    &.${activeClassName} {
        border-radius: 12px;
        font-weight: 600;
        color: #ffffff;
    }
    :hover,
    :focus {
      border-radius: 12px;
      font-weight: 600;
    }
  `;

const StyledExternalLink = styled(ExternalLink).attrs({
    activeClassName,
}) <{ isActive?: boolean }>`
    align-items: left;
    // display: none
    border-radius: 3rem;
    outline: none;
    cursor: pointer;
    text-decoration: none;
    font-size: 18px;
    font-weight: 600;
    line-height: 34px;
    width: fit-content;
    margin: 0 12px;
    color: #ffffff;
    opacity: 0.65;
    word-break: keep-all;

    &.${activeClassName} {
      border-radius: 12px;
      font-weight: 600;
    }
    :hover,
    :focus {
        opacity: 1;
        text-decoration: none;
    }
    @media (max-width: ${themeBreakPoints.sm}) {
        display: none;
    };
`;

const ToolbarContent = (props: Props) => {
    const handleLogoClick: React.EventHandler<React.MouseEvent> = e => {
        e.preventDefault();
        props.onGoToHome();
    };

    const startContent = (
        <>
            <HeaderRow>
                <Title href=".">
                    <UniIcon>
                        <img width={'85px'} src={Logo} alt="logo" onClick={handleLogoClick} />
                    </UniIcon>
                </Title>
                <HeaderLinks>
                    <StyledExternalLink
                        id={`swap-nav-link`}
                        href={'https://swap.smartdex.app/#/swap'}
                    >
                        Swap
                    </StyledExternalLink>
                    <StyledNavLink
                        id={`trade-nav-link`}
                        to={'/'}
                    >
                        Trade
                    </StyledNavLink>
                    <StyledExternalLink
                        id={`pool-nav-link`}
                        href={'https://swap.smartdex.app/#/pool'}
                    >
                        Pool
                    </StyledExternalLink>
                    <StyledExternalLink
                        id={`stake-nav-link`}
                        href={'https://swap.smartdex.app/#/niox'}
                    >
                        Farm
                    </StyledExternalLink>
                    <StyledExternalLink
                        id={`stake-nav-link`}
                        href={'https://info.smartdex.app'}
                    >
                        Charts
                    </StyledExternalLink>
                </HeaderLinks>
            </HeaderRow>
        </>
    );

    const handleMyWalletClick: React.EventHandler<React.MouseEvent> = e => {
        e.preventDefault();
        props.onGoToWallet();
    };

    const endContent = (
        <>
            <MaticBridgeContainer />
            <WalletDropdown />
            <NotificationsDropdownContainer />
        </>
    );

    return <ToolbarContainer startContent={startContent} endContent={endContent} />;
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
