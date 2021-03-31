import React, { HTMLAttributes } from 'react';
import styled from 'styled-components';
import { ReactComponent as InstallMetamaskSvg } from '../../assets/icons/install_metamask.svg';

interface Props extends HTMLAttributes<HTMLDivElement>, ErrorProps {
    text: string;
}

interface ErrorProps {
    fontSize?: FontSize;
    icon?: ErrorIcons;
    textAlign?: string;
}

export enum ErrorIcons {
    Lock = 1,
    Sad = 2,
    Metamask = 3,
    Warning = 4,
}

export enum FontSize {
    Large = 1,
    Medium = 2,
}

const ErrorCardContainer = styled.div<ErrorProps>`
    align-items: center;
    background-color: rgba(255, 255, 255, 0.1);;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #FFFFFF;
    opacity: 0.65;
    display: flex;
    font-size: ${props => (props.fontSize === FontSize.Large ? '16px' : '14px')};
    line-height: 1.2;
    padding: 16px 20px;
    ${props => (props.textAlign === 'center' ? 'justify-content: center;' : '')}
`;

const IconContainer = styled.span`
    margin-right: 20px;
    width: 20px;
    height: 20px;
    svg {
        width: 100%;
        height: 100% !important;
    }
`;

const getIcon = (icon: ErrorIcons) => {
    let theIcon: any;
    if (icon === ErrorIcons.Metamask) {
        theIcon = <InstallMetamaskSvg />;
    }
    return <IconContainer>{theIcon}</IconContainer>;
};

export const MetamaskErrorCard: React.FC<Props> = props => {
    const { text, icon, ...restProps } = props;
    const errorIcon = icon ? getIcon(icon) : null;

    return (
        <ErrorCardContainer {...restProps}>
            {errorIcon}
            {text}
        </ErrorCardContainer>
    );
};
