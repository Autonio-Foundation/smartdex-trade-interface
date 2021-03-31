import React, { HTMLAttributes } from 'react';
import styled from 'styled-components';

import { TabItem } from '../../util/types';

interface Props extends HTMLAttributes<HTMLDivElement> {
    tabs: TabItem[];
}

interface ItemProps {
    active?: boolean;
}

const CardTabSelectorWrapper = styled.div`
    align-items: center;
    color: ${props => props.theme.componentsTheme.lightGray};
    display: flex;
    font-size: 14px;
    font-weight: 500;
    justify-content: space-between;
    line-height: 1.2;
`;

const CardTabSelectorItem = styled.span<ItemProps>`
    cursor: ${props => (props.active ? 'default' : 'pointer')};
    opacity: ${props => (props.active ? 1 : 0.65)};
    user-select: none;
`;

const CardTabSelectorItemSeparator = styled.span<ItemProps>`
    color: #dedede;
    cursor: default;
    font-weight: 400;
    padding: 0 5px;
    user-select: none;

    &:last-child {
        display: none;
    }
`;

export const CardTabSelector: React.FC<Props> = props => {
    const { tabs, ...restProps } = props;

    return (
        <CardTabSelectorWrapper {...restProps}>
            {tabs.map((item, index) => {
                return (
                    <React.Fragment key={index}>
                        <CardTabSelectorItem onClick={item.onClick} active={item.active}>
                            {item.text}
                        </CardTabSelectorItem>
                        <CardTabSelectorItemSeparator>/</CardTabSelectorItemSeparator>
                    </React.Fragment>
                );
            })}
        </CardTabSelectorWrapper>
    );
};
