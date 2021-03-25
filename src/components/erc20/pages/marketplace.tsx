import React from 'react';

import { CheckMetamaskStateModalContainer } from '../../common/check_metamask_state_modal_container';
import { ColumnNarrow } from '../../common/column_narrow';
import { ColumnWide } from '../../common/column_wide';
import { Content } from '../common/content_wrapper';
import { BuySellContainer } from '../marketplace/buy_sell';
import { MarketsDropDown } from '../marketplace/market_dropdown';
import { OrderBookTableContainer } from '../marketplace/order_book';
import { OrderChartContainer } from '../marketplace/order_chart';
import { OrderHistoryContainer } from '../marketplace/order_history';
import { TradeHistoryContainer } from '../marketplace/trade_history';
import { WalletBalanceContainer } from '../marketplace/wallet_balance';




class Marketplace extends React.PureComponent {
    public render = () => {
        return (
            <Content>
                <ColumnNarrow>
                    <MarketsDropDown />
                    <WalletBalanceContainer />
                    <BuySellContainer />
                </ColumnNarrow>
                <ColumnWide style={{ height: '100%', maxHeight: '100%' }}>
                    <OrderChartContainer />
                    <OrderHistoryContainer />
                </ColumnWide>
                <ColumnNarrow style={{ height: '100%', maxHeight: '100%' }}>
                    <OrderBookTableContainer />
                    <TradeHistoryContainer />
                </ColumnNarrow>
                <CheckMetamaskStateModalContainer />
            </Content>
        );
    };
}

export { Marketplace };
