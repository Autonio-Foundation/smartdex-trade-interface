import React from 'react';
import styled, { withTheme } from 'styled-components';
import { separatorTopbar } from '../../components/common/toolbar';

interface Props {
}

interface State {
    open: Boolean;
}

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
        open: false
    };

    constructor(props: Props) {
        super(props);
    }

    public componentDidMount = async () => {
    };

    public render = () => {
        return (
            <>
                <MaticBridgeLink>
                    Matic Bridge
                </MaticBridgeLink>
            </>
        );
    };

}

const MaticBridgeContainer = withTheme(
    MaticBridge,
);

export { MaticBridgeContainer };
