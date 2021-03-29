import { assetDataUtils, OrderStatus, BigNumber } from '0x.js';
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { themeDimensions } from '../../../themes/commons';

import { UI_DECIMALS_DISPLAYED_PRICE_ETH } from '../../../common/constants';
import { getBaseToken, getQuoteToken, getUserOrders, getWeb3State } from '../../../store/selectors';
import { tokenAmountInUnits, tokenAmountInUnitsToBigNumber } from '../../../util/tokens';
import { OrderSide, StoreState, Token, UIOrder, Web3State } from '../../../util/types';
import { CardBase } from '../../common/card_base';
import { EmptyContent } from '../../common/empty_content';
import { LoadingWrapper } from '../../common/loading';
import { CustomTD, Table, TH, THead, TR } from '../../common/table';
import { ordersToUIOrdersWithoutOrderInfo } from '../../../util/ui_orders';

import { CancelOrderButtonContainer } from './cancel_order_button';
import { getOrderHistory } from '../../../store/actions';
import { getKnownTokens } from '../../../util/known_tokens';

interface StateProps {
    baseToken: Token | null;
    orders: UIOrder[];
    quoteToken: Token | null;
    web3State?: Web3State;
}

interface DispatchProps {
    onGetOrderHistory: () => Promise<any>;
}

type Props = StateProps & DispatchProps;

const SideTD = styled(CustomTD) <{ side: OrderSide }>`
    color: ${props =>
        props.side === OrderSide.Buy ? props.theme.componentsTheme.green : props.theme.componentsTheme.red};
`;

const CardWrapper = styled(CardBase)`
    display: flex;
    flex-direction: column;
    margin-bottom: ${themeDimensions.verticalSeparationSm};
    max-height: 100%;

    &:last-child {
        margin-bottom: 0;
    }
`;

const CardHeader = styled.div`
    align-items: center;
    display: flex;
    flex-grow: 0;
    flex-shrink: 0;
    justify-content: space-between;
    padding: ${themeDimensions.verticalPadding} ${themeDimensions.horizontalPadding};
`;

const CardTitle = styled.h1`
    color: #fff;
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
    line-height: 1.2;
    margin: 0;
    padding: 0 20px 0 0;
    width: 100%;
`;

const CardBody = styled.div`
    margin: 0;
    min-height: 200px;
    overflow-x: auto;
    padding: ${themeDimensions.verticalPadding} ${themeDimensions.horizontalPadding};
    position: relative;    
    max-height: 200px;
    overflow-y: auto;
`;

function pad_with_zeroes(number: number, length: number) {
    var my_string = '' + number;
    while (my_string.length < length) {
        my_string = '0' + my_string;
    }
    return my_string;
}
const orderToRow = (order: UIOrder, index: number, baseToken: Token) => {
    const sideLabel = order.side === OrderSide.Sell ? 'Sell' : 'Buy';
    const size = tokenAmountInUnits(order.size, baseToken.decimals, baseToken.displayDecimals);
    let status = '--';
    let isOrderFillable = false;
    let datetime = new Date(parseInt(order.rawOrder.salt.toString()));
    let dateStr = `${pad_with_zeroes(datetime.getMonth() + 1, 2)}-${pad_with_zeroes(datetime.getDate(), 2)} ${pad_with_zeroes(datetime.getHours(), 2)}:${pad_with_zeroes(datetime.getMinutes(), 2)}:${pad_with_zeroes(datetime.getSeconds(), 2)}`

    const filled = order.filled
        ? tokenAmountInUnits(order.filled, baseToken.decimals, baseToken.displayDecimals)
        : null;
    if (order.status) {
        isOrderFillable = order.status === OrderStatus.Fillable;
        status = isOrderFillable ? 'Open' : 'Filled';
    }

    const price = parseFloat(order.price.toString()).toFixed(UI_DECIMALS_DISPLAYED_PRICE_ETH);

    return (
        <TR key={index}>
            <CustomTD styles={{ textAlign: 'left', tabular: true }}>{dateStr}</CustomTD>
            <SideTD side={order.side}>{sideLabel}</SideTD>
            <CustomTD styles={{ textAlign: 'right', tabular: true }}>{size}</CustomTD>
            <CustomTD styles={{ textAlign: 'right', tabular: true }}>{filled}</CustomTD>
            <CustomTD styles={{ textAlign: 'right', tabular: true }}>{price}</CustomTD>
            <CustomTD styles={{ textAlign: 'right', tabular: true }}>{status}</CustomTD>
            <CustomTD styles={{ textAlign: 'center' }}>
                {isOrderFillable ? <CancelOrderButtonContainer order={order} /> : ''}
            </CustomTD>
        </TR>
    );
};

const orderHistoryToRow = (order: UIOrder, index: number, baseToken: Token) => {
    const sideLabel = order.side === OrderSide.Sell ? 'Sell' : 'Buy';
    const size = tokenAmountInUnits(order.size, baseToken.decimals, baseToken.displayDecimals);

    let datetime = new Date(parseInt(order.rawOrder.salt.toString()));
    let dateStr = `${pad_with_zeroes(datetime.getMonth() + 1, 2)}-${pad_with_zeroes(datetime.getDate(), 2)} ${pad_with_zeroes(datetime.getHours(), 2)}:${pad_with_zeroes(datetime.getMinutes(), 2)}:${pad_with_zeroes(datetime.getSeconds(), 2)}`

    const price = parseFloat(order.price.toString()).toFixed(UI_DECIMALS_DISPLAYED_PRICE_ETH);

    return (
        <TR key={index}>
            <CustomTD styles={{ textAlign: 'left', tabular: true }}>{dateStr}</CustomTD>
            <SideTD side={order.side}>{sideLabel}</SideTD>
            <CustomTD styles={{ textAlign: 'right', tabular: true }}>{size}</CustomTD>
            <CustomTD styles={{ textAlign: 'right', tabular: true }}>{price}</CustomTD>
            <CustomTD styles={{ textAlign: 'right', tabular: true }}>{order.status}</CustomTD>
        </TR>
    );
};

interface State {
    selectedTabs: number | 0;
    myhistory: Array<any>;
}

class OrderHistory extends React.Component<Props, State> {
    public state: State = {
        selectedTabs: 0,
        myhistory: []
    }

    public componentDidUpdate = async (prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) => {
        const { baseToken, quoteToken } = this.props;
        if (prevProps !== this.props && baseToken && quoteToken) {
            let ht = await this.props.onGetOrderHistory();

            ht && ht.map((cur: any) => {
                cur.makerFee = new BigNumber(cur.makerFee);
                cur.takerFee = new BigNumber(cur.takerFee);
                cur.makerAssetAmount = new BigNumber(cur.makerAssetAmount);
                cur.takerAssetAmount = new BigNumber(cur.takerAssetAmount);
                cur.salt = new BigNumber(cur.salt);
                cur.expirationTimeSeconds = new BigNumber(cur.expirationTimeSeconds);
            })

            let myhistory = ordersToUIOrdersWithoutOrderInfo(ht ? ht : [], baseToken);

            myhistory && myhistory.map((cur: any, idx: number) => {
                cur.status = ht[idx].status;
            })
            this.setState({ myhistory });
        }
    }

    public onSelectTab = (tabIdx: number) => {
        this.setState({ selectedTabs: tabIdx });
    }

    public render = () => {
        const { orders, baseToken, quoteToken, web3State } = this.props;
        const { selectedTabs, myhistory } = this.state;
        const ordersToShow = orders.filter(order => order.status === OrderStatus.Fillable);

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
                } else if ((!ordersToShow.length && selectedTabs === 0) || (selectedTabs === 1 && !myhistory.length) || !baseToken || !quoteToken) {
                    content = <EmptyContent alignAbsoluteCenter={true} text="There are no orders to show" />;
                } else {
                    if (selectedTabs === 0) {
                        content = (
                            <Table isResponsive={true}>
                                <THead>
                                    <TR>
                                        <TH>Date</TH>
                                        <TH>Side</TH>
                                        <TH styles={{ textAlign: 'right' }}>Size ({baseToken.symbol})</TH>
                                        <TH styles={{ textAlign: 'right' }}>Filled ({baseToken.symbol})</TH>
                                        <TH styles={{ textAlign: 'right' }}>Price ({quoteToken.symbol})</TH>
                                        <TH styles={{ textAlign: 'right' }}>Status</TH>
                                        {/* <TH>&nbsp;</TH> */}
                                    </TR>
                                </THead>
                                <tbody>{ordersToShow.map((order, index) => orderToRow(order, index, baseToken))}</tbody>
                            </Table>
                        );
                    }
                    else if (selectedTabs === 1) {
                        content = (
                            <Table isResponsive={true}>
                                <THead>
                                    <TR>
                                        <TH>Date</TH>
                                        <TH>Side</TH>
                                        <TH styles={{ textAlign: 'right' }}>Size ({baseToken.symbol})</TH>
                                        <TH styles={{ textAlign: 'right' }}>Price ({quoteToken.symbol})</TH>
                                        <TH styles={{ textAlign: 'right' }}>Status</TH>
                                        {/* <TH>&nbsp;</TH> */}
                                    </TR>
                                </THead>
                                <tbody>{myhistory.map((order, index) => orderHistoryToRow(order, index, baseToken))}</tbody>
                            </Table>
                        );
                    }
                }
                break;
            }
        }

        return (
            <CardWrapper style={{ height: '280px' }}>
                <CardHeader>
                    <CardTitle>
                        <span style={{ color: '#fff', opacity: selectedTabs === 0 ? 1 : 0.65, cursor: 'pointer' }} onClick={() => this.onSelectTab(0)}>Open Orders</span>
                        <span style={{ marginLeft: 20, color: '#fff', opacity: selectedTabs === 1 ? 1 : 0.65, cursor: 'pointer' }} onClick={() => this.onSelectTab(1)}>Closed Orders</span>
                    </CardTitle>
                </CardHeader>
                <CardBody>{content}</CardBody>
            </CardWrapper>
        )
        // <Card title="Orders">{content}</Card>;
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

const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return {
        onGetOrderHistory: () =>
            dispatch(getOrderHistory()),
    }
}

const OrderHistoryContainer = connect(mapStateToProps, mapDispatchToProps)(OrderHistory);

export { OrderHistory, OrderHistoryContainer };
