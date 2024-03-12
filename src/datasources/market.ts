import { Address } from '@graphprotocol/graph-ts';

import {
    Escrow,
    Deposit,
    Withdraw,
    Borrow,
    Repay,
    Liquidate,
} from '../../generated/schema';

import {
    CreateEscrow as CreateEscrowEvent,
    Deposit      as DepositEvent,
    Withdraw     as WithdrawEvent,
    Borrow       as BorrowEvent,
    Repay        as RepayEvent,
    Liquidate    as LiquidateEvent,
    SetOracleCall,
    SetBorrowControllerCall,
    SetCollateralFactorBpsCall,
} from '../../generated/templates/market/Market'

import {
    Escrow as EscrowContract,
} from '../../generated/templates/market/Escrow'

import {
    BorrowController as BorrowControllerContract,
} from '../../generated/templates/market/BorrowController'


import {
    events,
    decimals,
    transactions,
} from '@amxx/graphprotocol-utils'

import {
    fetchAccount,
} from '@openzeppelin/subgraphs/src/fetch/account';

import {
    fetchERC20,
} from '@openzeppelin/subgraphs/src/fetch/erc20';

import {
    fetchMarket,
    fetchBorrowController,
} from "../fetch"

export function handleSetOracle(call: SetOracleCall) : void {
    fetchMarket(call.to) // update price
}

export function handleSetBorrowController(call: SetBorrowControllerCall) : void {
    let market        = fetchMarket(call.to)
    market.controller = fetchBorrowController(call.inputs._borrowController).id
    market.dailyLimit = BorrowControllerContract.bind(call.inputs._borrowController).dailyLimits(call.to)
    market.save()
}

export function handleSetCollateralFactorBps(call: SetCollateralFactorBpsCall) : void {
    let market                 = fetchMarket(call.to)
    market.collateralFactorBPS = call.inputs._collateralFactorBps
    market.save()
}

export function handleCreateEscrow(event: CreateEscrowEvent): void {
    let contract = EscrowContract.bind(event.params.escrow)
    let token    = contract.try_token()

    let escrow         = new Escrow(event.params.escrow);
    escrow.market      = fetchMarket(event.address).id
    escrow.beneficiary = fetchAccount(event.params.user).id
    escrow.token       = token.reverted ? null : fetchERC20(token.value).id
    escrow.save()
}

export function handleDeposit(event: DepositEvent): void {
    let market = fetchMarket(event.address)
    let erc20  = fetchERC20(Address.fromBytes(market.collateral))

    let ev         = new Deposit(events.id(event))
    ev.emitter     = fetchAccount(event.address).id
    ev.transaction = transactions.log(event).id
    ev.timestamp   = event.block.timestamp
    ev.market      = market.id
    ev.account     = fetchAccount(event.params.account).id
    ev.amountExact = event.params.amount
    ev.amount      = decimals.toDecimals(event.params.amount, erc20.decimals)
    ev.save()
}

export function handleWithdraw(event: WithdrawEvent): void {
    let market = fetchMarket(event.address)
    let erc20  = fetchERC20(Address.fromBytes(market.collateral))

    let ev         = new Withdraw(events.id(event))
    ev.emitter     = fetchAccount(event.address).id
    ev.transaction = transactions.log(event).id
    ev.timestamp   = event.block.timestamp
    ev.market      = market.id
    ev.account     = fetchAccount(event.params.account).id
    ev.to          = fetchAccount(event.params.to).id
    ev.amountExact = event.params.amount
    ev.amount      = decimals.toDecimals(event.params.amount, erc20.decimals)
    ev.save()
}

export function handleBorrow(event: BorrowEvent): void {
    let market = fetchMarket(event.address)
    let erc20  = fetchERC20(Address.fromBytes(market.collateral))

    let ev         = new Borrow(events.id(event))
    ev.emitter     = fetchAccount(event.address).id
    ev.transaction = transactions.log(event).id
    ev.timestamp   = event.block.timestamp
    ev.market      = market.id
    ev.account     = fetchAccount(event.params.account).id
    ev.amountExact = event.params.amount
    ev.amount      = decimals.toDecimals(event.params.amount, 18)
    ev.save()
}

export function handleRepay(event: RepayEvent): void {
    let market = fetchMarket(event.address)
    let erc20  = fetchERC20(Address.fromBytes(market.collateral))

    let ev         = new Repay(events.id(event))
    ev.emitter     = fetchAccount(event.address).id
    ev.transaction = transactions.log(event).id
    ev.timestamp   = event.block.timestamp
    ev.market      = market.id
    ev.account     = fetchAccount(event.params.account).id
    ev.repayer     = fetchAccount(event.params.repayer).id
    ev.amountExact = event.params.amount
    ev.amount      = decimals.toDecimals(event.params.amount, 18)
    ev.save()
}

export function handleLiquidate(event: LiquidateEvent): void {
    let market = fetchMarket(event.address)
    let erc20  = fetchERC20(Address.fromBytes(market.collateral))

    let ev                   = new Liquidate(events.id(event))
    ev.emitter               = fetchAccount(event.address).id
    ev.transaction           = transactions.log(event).id
    ev.timestamp             = event.block.timestamp
    ev.market                = market.id
    ev.account               = fetchAccount(event.params.account).id
    ev.liquidator            = fetchAccount(event.params.liquidator).id
    ev.liquidatorRewardExact = event.params.liquidatorReward
    ev.liquidatorReward      = decimals.toDecimals(event.params.liquidatorReward, erc20.decimals)
    ev.repaidDebtExact       = event.params.repaidDebt
    ev.repaidDebt            = decimals.toDecimals(event.params.repaidDebt, 18)
    ev.save()
}
