import React, { HTMLAttributes } from 'react';
import styled from 'styled-components';

import { WarningSmallIcon } from '../../components/common/icons/warning_small_icon';
import { ReactComponent as InstallMetamaskSvg } from '../../assets/icons/install_metamask.svg';
import { themeDimensions } from '../../themes/commons';
import { ButtonIcons, ButtonVariant } from '../../util/types';

interface Props extends HTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    disabled?: boolean;
    icon?: ButtonIcons;
    variant?: ButtonVariant;
}

const StyledButton = styled.button<{ variant?: ButtonVariant }>`
    ${props =>
        props.variant && props.variant === ButtonVariant.Primary
            ? `background-color: ${props.theme.componentsTheme.buttonPrimaryBackgroundColor};`
            : ''}
    ${props =>
        props.variant && props.variant === ButtonVariant.Secondary
            ? `background-color: ${props.theme.componentsTheme.buttonSecondaryBackgroundColor};`
            : ''}
    ${props =>
        props.variant && props.variant === ButtonVariant.Tertiary
            ? `background-color: ${props.theme.componentsTheme.buttonTertiaryBackgroundColor};`
            : ''}
    ${props =>
        props.variant && props.variant === ButtonVariant.Quaternary
            ? `background-color: ${props.theme.componentsTheme.buttonQuaternaryBackgroundColor};`
            : ''}
    ${props =>
        props.variant && props.variant === ButtonVariant.Error
            ? `background-color: ${props.theme.componentsTheme.buttonErrorBackgroundColor};`
            : ''}
    ${props =>
        props.variant && props.variant === ButtonVariant.Balance
            ? `background-color: ${props.theme.componentsTheme.ethBoxActiveColor};`
            : ''}
    ${props =>
        props.variant && props.variant === ButtonVariant.Sell
            ? `background-color: ${props.theme.componentsTheme.buttonSellBackgroundColor};`
            : ''}
    ${props =>
        props.variant && props.variant === ButtonVariant.Buy
            ? `background-color: ${props.theme.componentsTheme.buttonBuyBackgroundColor};`
            : ''}
    ${props =>
        props.variant && props.variant === ButtonVariant.Wallet
            ? `background-color: ${props.theme.componentsTheme.buttonWalletBackgroundColor};`
            : ''}
    ${props =>
        props.variant && props.variant === ButtonVariant.Bridge
            ? `background-color: ${props.theme.componentsTheme.buttonBridgeBackgroundColor};`
            : ''}

    align-items: center;
    border-radius: 4px;
    border: none;
    color: ${props => props.theme.componentsTheme.buttonTextColor};
    cursor: pointer;
    display: flex;
    font-size: 16px;
    font-weight: 600;
    justify-content: center;
    line-height: 1.2;
    padding: 15px;
    transition: background-color 0.25s ease-out;
    user-select: none;

    &:focus {
        outline: none;
    }

    &:disabled {
        cursor: default;
        opacity: 0.5;
    }
`;

const ButtonIcon = styled.span`
    align-items: center;
    display: flex;
    line-height: 1;
    margin-right: 14px;
    height: 20px;
    width: 20px;
`;

const getIcon = (icon: ButtonIcons) => {
    let buttonIcon: React.ReactNode = null;

    if (icon === ButtonIcons.Warning) {
        buttonIcon = <WarningSmallIcon />;
    }
    if (icon === ButtonIcons.Metamask) {
        buttonIcon = <InstallMetamaskSvg />;
    }

    return buttonIcon ? <ButtonIcon>{buttonIcon}</ButtonIcon> : null;
};

export const Button: React.FC<Props> = props => {
    const { children, icon, ...restProps } = props;

    return (
        <StyledButton {...restProps}>
            {icon ? getIcon(icon) : null}
            {children}
        </StyledButton>
    );
};
