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
    SetBorrowControllerCall,
} from '../../generated/templates/market/Market'

import {
    Escrow as EscrowContract,
} from '../../generated/templates/market/Escrow'

import {
    BorrowController as BorrowControllerContract,
} from '../../generated/templates/market/BorrowController'


import {
	events,
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
} from "../fetch/market"

export function handleSetBorrowController(call: SetBorrowControllerCall) : void {
    let market = fetchMarket(call.to)
    market.controller = fetchBorrowController(call.inputs._borrowController).id
    market.dailyLimit = BorrowControllerContract.bind(call.inputs._borrowController).dailyLimits(call.to)
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
    let ev         = new Deposit(events.id(event))
    ev.emitter     = fetchAccount(event.address).id
    ev.transaction = transactions.log(event).id
    ev.timestamp   = event.block.timestamp
    ev.market      = fetchMarket(event.address).id
    ev.account     = fetchAccount(event.params.account).id
    ev.amount      = event.params.amount
    ev.save()
}

export function handleWithdraw(event: WithdrawEvent): void {
    let ev         = new Withdraw(events.id(event))
    ev.emitter     = fetchAccount(event.address).id
    ev.transaction = transactions.log(event).id
    ev.timestamp   = event.block.timestamp
    ev.market      = fetchMarket(event.address).id
    ev.account     = fetchAccount(event.params.account).id
    ev.to          = fetchAccount(event.params.to).id
    ev.amount      = event.params.amount
    ev.save()
}

export function handleBorrow(event: BorrowEvent): void {
    let ev         = new Borrow(events.id(event))
    ev.emitter     = fetchAccount(event.address).id
    ev.transaction = transactions.log(event).id
    ev.timestamp   = event.block.timestamp
    ev.market      = fetchMarket(event.address).id
    ev.account     = fetchAccount(event.params.account).id
    ev.amount      = event.params.amount
    ev.save()
}

export function handleRepay(event: RepayEvent): void {
    let ev         = new Repay(events.id(event))
    ev.emitter     = fetchAccount(event.address).id
    ev.transaction = transactions.log(event).id
    ev.timestamp   = event.block.timestamp
    ev.market      = fetchMarket(event.address).id
    ev.account     = fetchAccount(event.params.account).id
    ev.repayer     = fetchAccount(event.params.repayer).id
    ev.amount      = event.params.amount
    ev.save()
}

export function handleLiquidate(event: LiquidateEvent): void {
    let ev              = new Liquidate(events.id(event))
    ev.emitter          = fetchAccount(event.address).id
    ev.transaction      = transactions.log(event).id
    ev.timestamp        = event.block.timestamp
    ev.market           = fetchMarket(event.address).id
    ev.account          = fetchAccount(event.params.account).id
    ev.liquidator       = fetchAccount(event.params.liquidator).id
    ev.liquidatorReward = event.params.liquidatorReward
    ev.repaidDebt       = event.params.repaidDebt
    ev.save()
}
