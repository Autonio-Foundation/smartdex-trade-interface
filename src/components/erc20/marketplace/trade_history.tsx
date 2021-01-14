import { assetDataUtils, BigNumber, SignedOrder } from '0x.js';
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { themeDimensions } from '../../../themes/commons';

import { UI_DECIMALS_DISPLAYED_PRICE_ETH } from '../../../common/constants';
import { getBaseToken, getQuoteToken, getWeb3State, getOverallHistory } from '../../../store/selectors';
import { tokenAmountInUnits, tokenAmountInUnitsToBigNumber } from '../../../util/tokens';
import { OrderSide, StoreState, Token, Web3State } from '../../../util/types';
import { CardBase } from '../../common/card_base';
import { EmptyContent } from '../../common/empty_content';
import { LoadingWrapper } from '../../common/loading';
import { CustomTD, Table, TH, THead, TR } from '../../common/table';

import { getKnownTokens } from '../../../util/known_tokens';

interface StateProps {
    baseToken: Token | null;
    overallHistory: SignedOrder[];
    quoteToken: Token | null;
    web3State?: Web3State;
}

type Props = StateProps;

const SideTD = styled(CustomTD)<{ side: OrderSide }>`
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
`;

const allOrderHistoryToRow = (order: any, index: number, baseToken: Token) => {
    const baseTokenEncoded = assetDataUtils.encodeERC20AssetData(baseToken.address);

    const sideLabel = order.takerAssetData === baseTokenEncoded ? 'Sell' : 'Buy'; //reversed

    const size = tokenAmountInUnits(sideLabel === 'Buy' ? new BigNumber(order.takerAssetAmount) : new BigNumber(order.makerAssetAmount), baseToken.decimals, baseToken.displayDecimals);

    const makerAssetAddress = assetDataUtils.decodeERC20AssetData(order.makerAssetData).tokenAddress;
    const makerAssetTokenDecimals = getKnownTokens().getTokenByAddress(makerAssetAddress).decimals;
    const makerAssetAmountInUnits = tokenAmountInUnitsToBigNumber(new BigNumber(order.makerAssetAmount), makerAssetTokenDecimals);

    const takerAssetAddress = assetDataUtils.decodeERC20AssetData(order.takerAssetData).tokenAddress;
    const takerAssetTokenDecimals = getKnownTokens().getTokenByAddress(takerAssetAddress).decimals;
    const takerAssetAmountInUnits = tokenAmountInUnitsToBigNumber(new BigNumber(order.takerAssetAmount), takerAssetTokenDecimals);
    const priceV = sideLabel === 'Sell'
        ? makerAssetAmountInUnits.div(takerAssetAmountInUnits)
        : takerAssetAmountInUnits.div(makerAssetAmountInUnits);


    const price = parseFloat(priceV.toString()).toFixed(UI_DECIMALS_DISPLAYED_PRICE_ETH);

    return order.status === 'Executed' && (
        <TR key={index}>
            <SideTD side={sideLabel === 'Buy' ? OrderSide.Buy : OrderSide.Sell}>{sideLabel}</SideTD>
            <CustomTD styles={{ textAlign: 'right', tabular: true }}>{size}</CustomTD>
            <CustomTD styles={{ textAlign: 'right', tabular: true }}>{price}</CustomTD>
        </TR>
    );
};

interface State {
    myhistory: Array<any>;
}

class TradeHistory extends React.Component<Props, State> {
    public state: State = {
        myhistory: []
    }

    public render = () => {
        const { baseToken, quoteToken, web3State, overallHistory } = this.props;

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
                } else if (!overallHistory.length || !baseToken || !quoteToken) {
                    content = <EmptyContent alignAbsoluteCenter={true} text="There are no orders to show" />;
                } else {
                    // console.log(overallHistory);
                    content = (
                        <Table isResponsive={true}>
                            <THead>
                                <TR>
                                    <TH>Side</TH>
                                    <TH styles={{ textAlign: 'right' }}>Size ({baseToken.symbol})</TH>
                                    <TH styles={{ textAlign: 'right' }}>Price ({quoteToken.symbol})</TH>
                                    <TH>&nbsp;</TH>
                                </TR>
                            </THead>
                            <tbody>{overallHistory.map((order, index) => allOrderHistoryToRow(order, index, baseToken))}</tbody>
                        </Table>
                    );
                }
                break;
            }
        }

        return (
            <CardWrapper style={{maxHeight: 'calc(100% - 570px)', height: 'calc(100% - 570px)'}}>
                <CardHeader>
                    <CardTitle>
                        <span style={{color: '#0FEE90'}}>Recent Trades</span>
                    </CardTitle>
                </CardHeader>
                <CardBody>{content}</CardBody>
            </CardWrapper>
        )
    };
}

const mapStateToProps = (state: StoreState): StateProps => {
    return {
        baseToken: getBaseToken(state),
        overallHistory: getOverallHistory(state),
        quoteToken: getQuoteToken(state),
        web3State: getWeb3State(state),
    };
};

const TradeHistoryContainer = connect(mapStateToProps)(TradeHistory);

export { TradeHistory, TradeHistoryContainer };
