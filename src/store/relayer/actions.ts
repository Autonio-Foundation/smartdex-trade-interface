import { BigNumber, SignedOrder } from '0x.js';
import { createAction } from 'typesafe-actions';

import { AFFILIATE_FEE_PERCENTAGE, FEE_RECIPIENT } from '../../common/constants';
import { INSUFFICIENT_ORDERS_TO_FILL_AMOUNT_ERR } from '../../exceptions/common';
import { InsufficientOrdersAmountException } from '../../exceptions/insufficient_orders_amount_exception';
import { RelayerException } from '../../exceptions/relayer_exception';
import {
    cancelSignedOrder,
    getAllOrdersAsUIOrders,
    getAllOrdersAsUIOrdersWithoutOrdersInfo,
    getUserOrdersAsUIOrders,
    getOverallOrders
} from '../../services/orders';
import { RELAYER_URL } from '../../common/constants';
import { getRelayer } from '../../services/relayer';
import { isWeth } from '../../util/known_tokens';
import { getLogger } from '../../util/logger';
import { buildLimitOrder, buildMarketOrders, sumTakerAssetFillableOrders, createOHLVCDataset } from '../../util/orders';
import { getTransactionOptions } from '../../util/transactions';
import { NotificationKind, OrderSide, RelayerState, ThunkCreator, Token, UIOrder, Web3State } from '../../util/types';
import { updateTokenBalances } from '../blockchain/actions';
import { getAllCollectibles } from '../collectibles/actions';
import {
    getBaseToken,
    getEthAccount,
    getEthBalance,
    getGasPriceInWei,
    getMakerAddresses,
    getOpenBuyOrders,
    getOpenSellOrders,
    getQuoteToken,
    getWeb3State,
} from '../selectors';
import { addNotifications } from '../ui/actions';

const logger = getLogger('Store::Market::Actions');

export const initializeRelayerData = createAction('relayer/init', resolve => {
    return (relayerData: RelayerState) => resolve(relayerData);
});

export const setOrders = createAction('relayer/ORDERS_set', resolve => {
    return (orders: UIOrder[]) => resolve(orders);
});

export const setOverallHistory = createAction('relayer/OVERALLORDERHISTORY_set', resolve => {
    return (orders: any[]) => resolve(orders);
});

export const setUserOrders = createAction('relayer/USER_ORDERS_set', resolve => {
    return (orders: UIOrder[]) => resolve(orders);
});

export const getAllOrders: ThunkCreator = () => {
    return async (dispatch, getState) => {
        const state = getState();
        const baseToken = getBaseToken(state) as Token;
        const quoteToken = getQuoteToken(state) as Token;
        const web3State = getWeb3State(state) as Web3State;
        const makerAddresses = getMakerAddresses(state);
        try {
            let uiOrders: UIOrder[] = [];
            const isWeb3NotDoneState = [Web3State.Locked, Web3State.NotInstalled, Web3State.Error].includes(web3State);
            // tslint:disable-next-line:prefer-conditional-expression
            if (isWeb3NotDoneState) {
                uiOrders = await getAllOrdersAsUIOrdersWithoutOrdersInfo(baseToken, quoteToken, makerAddresses);
            } else {
                uiOrders = await getAllOrdersAsUIOrders(baseToken, quoteToken, makerAddresses);
            }
            let overall = await getOverallOrders(baseToken, quoteToken);
            dispatch(setOrders(uiOrders));
            dispatch(setOverallHistory(overall));
        } catch (err) {
            logger.error(`getAllOrders: fetch orders from the relayer failed.`, err);
        }
    };
};

export const getUserOrders: ThunkCreator = () => {
    return async (dispatch, getState) => {
        const state = getState();
        const baseToken = getBaseToken(state) as Token;
        const quoteToken = getQuoteToken(state) as Token;
        const ethAccount = getEthAccount(state);
        const web3State = getWeb3State(state) as Web3State;

        try {
            const isWeb3DoneState = web3State === Web3State.Done;
            // tslint:disable-next-line:prefer-conditional-expression
            if (isWeb3DoneState) {
                const myUIOrders = await getUserOrdersAsUIOrders(baseToken, quoteToken, ethAccount);
                dispatch(setUserOrders(myUIOrders));
            }
        } catch (err) {
            logger.error(`getUserOrders: fetch orders from the relayer failed.`, err);
        }
    };
};

export const cancelOrder: ThunkCreator = (order: UIOrder) => {
    return async (dispatch, getState) => {
        const state = getState();
        const baseToken = getBaseToken(state) as Token;
        const quoteToken = getQuoteToken(state) as Token;
        const gasPrice = getGasPriceInWei(state);

        // console.log(baseToken, quoteToken, order);

        const tx = cancelSignedOrder(order.rawOrder, gasPrice);

        // tslint:disable-next-line:no-floating-promises no-unsafe-any
        tx.then(transaction => {
            // tslint:disable-next-line:no-floating-promises
            dispatch(getOrderbookAndUserOrders());

            dispatch(
                addNotifications([
                    {
                        id: transaction.transactionHash,
                        kind: NotificationKind.CancelOrder,
                        amount: order.size,
                        token: baseToken,
                        timestamp: new Date(),
                        tx,
                    },
                ]),
            );
        });
    };
};

export const submitCollectibleOrder: ThunkCreator = (signedOrder: SignedOrder) => {
    return async dispatch => {
        try {
            const submitResult = await getRelayer().submitOrderAsync(signedOrder);
            // tslint:disable-next-line:no-floating-promises
            dispatch(getAllCollectibles());
            // TODO: Dispatch notification
            return submitResult;
        } catch (error) {
            throw new RelayerException(error.message);
        }
    };
};

export const submitLimitOrder: ThunkCreator = (signedOrder: SignedOrder, amount: BigNumber, side: OrderSide) => {
    return async (dispatch, getState) => {
        const state = getState();
        const baseToken = getBaseToken(state) as Token;
        const quoteToken = getQuoteToken(state) as Token;

        try {
            const submitResult = await getRelayer().submitOrderAsync(signedOrder);

            // tslint:disable-next-line:no-floating-promises
            dispatch(getOrderbookAndUserOrders());
            dispatch(
                addNotifications([
                    {
                        id: signedOrder.signature,
                        kind: NotificationKind.Limit,
                        amount,
                        token: baseToken,
                        side,
                        timestamp: new Date(),
                    },
                ]),
            );

            return submitResult;
        } catch (error) {
            throw new RelayerException(error.message);
        }
    };
};


export const getOrderHistory: ThunkCreator<Promise<Array<any>>> = () => {
    return async (dispatch, getState) => {
        const state = getState();
        const baseToken = getBaseToken(state) as Token;
        const quoteToken = getQuoteToken(state) as Token;
        const ethAccount = getEthAccount(state);
        const params = {
            base_token: baseToken.symbol,
            quote_token: quoteToken.symbol,
            address: ethAccount
        };

        let res: any[];

        var response = await (await fetch(RELAYER_URL + '/orderhistory?' + new URLSearchParams(params))).json();

        res = response;

        return res;
    }
}

export const submitMarketOrder: ThunkCreator<Promise<{ txHash: string; amountInReturn: BigNumber }>> = (
    amount: BigNumber,
    side: OrderSide,
) => {
    return async (dispatch, getState, { getContractWrappers, getWeb3Wrapper }) => {
        const state = getState();
        const ethAccount = getEthAccount(state);
        const gasPrice = getGasPriceInWei(state);

        const isBuy = side === OrderSide.Buy;
        const openSellOrders = getOpenSellOrders(state);
        const openBuyOrders = getOpenBuyOrders(state);
        const { orders, amounts, canBeFilled } = buildMarketOrders(
            {
                amount,
                orders: isBuy ? openSellOrders : openBuyOrders,
            },
            side,
        );

        // console.log(orders, amounts, canBeFilled);

        if (canBeFilled) {
            const baseToken = getBaseToken(state) as Token;
            const quoteToken = getQuoteToken(state) as Token;
            const contractWrappers = await getContractWrappers();

            // Check if the order is fillable using the forwarder
            const ethBalance = getEthBalance(state) as BigNumber;
            const ethAmountRequired = amounts.reduce((total: BigNumber, currentValue: BigNumber) => {
                return total.plus(currentValue);
            }, new BigNumber(0));
            const isEthBalanceEnough = ethBalance.isGreaterThan(ethAmountRequired);
            const isMarketSellForwarder = !isBuy && isWeth(baseToken.symbol) && isEthBalanceEnough;

            let txHash;
            // if (isMarketSellForwarder) {
            //     txHash = await contractWrappers.forwarder.marketSellOrdersWithEthAsync(
            //         orders,
            //         ethAccount,
            //         amount,
            //         [],
            //         0,
            //         FEE_RECIPIENT,
            //         getTransactionOptions(gasPrice),
            //     );
            // } else {
                if (isBuy) {
                    txHash = await contractWrappers.exchange.marketBuyOrdersAsync(
                        orders,
                        amount,
                        ethAccount,
                        getTransactionOptions(gasPrice),
                    );
                } else {
                    txHash = await contractWrappers.exchange.marketSellOrdersAsync(
                        orders,
                        amount,
                        ethAccount,
                        getTransactionOptions(gasPrice),
                    );
                }
            // }

            const web3Wrapper = await getWeb3Wrapper();
            const tx = web3Wrapper.awaitTransactionSuccessAsync(txHash);

            // tslint:disable-next-line:no-floating-promises
            dispatch(getOrderbookAndUserOrders());
            // tslint:disable-next-line:no-floating-promises
            dispatch(updateTokenBalances());

            createOHLVCDataset(
                {
                    buyOrders: openBuyOrders,
                    sellOrders: openSellOrders,
                    amount,
                    baseToken,
                    quoteToken
                },
                side,
                baseToken.decimals,
            );

            dispatch(
                addNotifications([
                    {
                        id: txHash,
                        kind: NotificationKind.Market,
                        amount,
                        token: baseToken,
                        side,
                        tx,
                        timestamp: new Date(),
                    },
                ]),
            );

            const amountInReturn = sumTakerAssetFillableOrders(side, orders, amounts);

            return { txHash, amountInReturn };
        } else {
            window.alert(INSUFFICIENT_ORDERS_TO_FILL_AMOUNT_ERR);
            throw new InsufficientOrdersAmountException();
        }
    };
};

export const getOrderbookAndUserOrders: ThunkCreator = () => {
    return async dispatch => {
        // tslint:disable-next-line:no-floating-promises
        dispatch(getAllOrders());
        // tslint:disable-next-line:no-floating-promises
        dispatch(getUserOrders());
    };
};

export const getOrderBook: ThunkCreator = () => {
    return async dispatch => {
        return dispatch(getAllOrders());
    };
};

export const fetchTakerAndMakerFee: ThunkCreator<Promise<{ makerFee: BigNumber; takerFee: BigNumber }>> = (
    amount: BigNumber,
    price: BigNumber,
    side: OrderSide,
) => {
    return async (dispatch, getState, { getContractWrappers }) => {
        const state = getState();
        const ethAccount = getEthAccount(state);
        const baseToken = getBaseToken(state) as Token;
        const quoteToken = getQuoteToken(state) as Token;
        const contractWrappers = await getContractWrappers();

        const order = await buildLimitOrder(
            {
                account: ethAccount,
                amount,
                price,
                baseTokenAddress: baseToken.address,
                quoteTokenAddress: quoteToken.address,
                exchangeAddress: contractWrappers.exchange.address,
            },
            side,
        );

        const { makerFee, takerFee } = order;

        return {
            makerFee,
            takerFee,
        };
    };
};
