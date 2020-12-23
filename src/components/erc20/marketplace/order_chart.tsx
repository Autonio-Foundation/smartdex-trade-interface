import { OrderStatus } from '0x.js';
import React from 'react';
import { connect } from 'react-redux';

import { getBaseToken, getQuoteToken, getUserOrders, getWeb3State } from '../../../store/selectors';
import { StoreState, Token, UIOrder, Web3State } from '../../../util/types';
import { Card } from '../../common/card';
import { EmptyContent } from '../../common/empty_content';
import { LoadingWrapper } from '../../common/loading';

import { TVChartContainer } from './TVChartContainer/index';
interface StateProps {
    baseToken: Token | null;
    orders: UIOrder[];
    quoteToken: Token | null;
    web3State?: Web3State;
}

type Props = StateProps;

class OrderChart extends React.Component<Props> {
    public render = () => {
        const { baseToken, quoteToken, web3State } = this.props;

        let content: React.ReactNode;
        switch (web3State) {
            case Web3State.Locked:
            case Web3State.NotInstalled:
            case Web3State.Loading: {
                content = <EmptyContent alignAbsoluteCenter={true} text="There are no orders to show" />;
                break;
            }
            default: {
                if (web3State !== Web3State.Error && (!baseToken || !quoteToken)) {
                    content = <LoadingWrapper minHeight="120px" />;
                } else {
                    content = (
                        <div className="main-box chart chartBox" style={{ minHeight: '530px', height: '530px' }}>
                            <div
                                className="box-body chart-body"
                                style={{ minHeight: '530px', height: '530px', padding: '0px' }}
                            >
                                <TVChartContainer props={this.props} />
                            </div>
                        </div>
                    );
                }
                break;
            }
        }

        return <Card title="Price Chart">{content}</Card>;
    };
}

const mapStateToProps = (state: StoreState): StateProps => {
    return {
        baseToken: getBaseToken(state),
        orders: getUserOrders(state),
        quoteToken: getQuoteToken(state),
        web3State: getWeb3State(state),
    };
};

const OrderChartContainer = connect(mapStateToProps)(OrderChart);

export { OrderChart, OrderChartContainer };
