import React from 'react';
import styled from 'styled-components';

import { themeDimensions } from '../../../themes/commons';
import { MarketsDropdownContainer } from '../common/markets_dropdown';

interface Props {
}

interface State {
}

const MarketsDropDownWrapper = styled.div`
    background-color: ${props => props.theme.componentsTheme.cardBackgroundColor};
    border-radius: ${themeDimensions.borderRadius};
    border: 1px solid ${props => props.theme.componentsTheme.cardBorderColor};
    padding: 24px 17px;
    margin-bottom: 12px;
    align-items: center;
    display: flex;
`;

class MarketsDropDown extends React.Component<Props, State> {
    public render = () => {
        return (
            <MarketsDropDownWrapper>
                <MarketsDropdownContainer />
            </MarketsDropDownWrapper>
        );
    };
}

export { MarketsDropDown };
