import { Address } from '@graphprotocol/graph-ts'

import {
	ERC20Balance,
	NewMarket,
} from '../../generated/schema'

import {
	DBR       as DBRContract,
	AddMarket as AddMarketEvent,
	Transfer  as TransferEvent,
} from '../../generated/dbr/DBR'

import {
	constants,
	decimals,
	events,
	transactions,
} from '@amxx/graphprotocol-utils'

import {
	fetchAccount,
} from '@openzeppelin/subgraphs/src/fetch/account'

import {
	fetchERC20,
} from '@openzeppelin/subgraphs/src/fetch/erc20'

import {
	fetchMarket
} from '../fetch/market'


export function handleAddMarket(event: AddMarketEvent): void {
	let market = fetchMarket(event.params.market);

	let ev         = new NewMarket(events.id(event))
	ev.emitter     = fetchAccount(event.address).id
	ev.transaction = transactions.log(event).id
	ev.timestamp   = event.block.timestamp
	ev.market      = market.id
	ev.save()
}

function update(token: Address, user: Address): void {
	let instance                  = DBRContract.bind(token)
	let dueTokensAccrued          = instance.try_dueTokensAccrued(user)
	let deficitOf                 = instance.try_deficitOf(user)

	let contract                  = fetchERC20(token);
	let balance                   = ERC20Balance.load(token.toHex().concat('/').concat(user.toHex()))!
	balance.dueTokensAccruedExact = dueTokensAccrued.reverted ? null : dueTokensAccrued.value
	balance.dueTokensAccrued      = dueTokensAccrued.reverted ? null : decimals.toDecimals(dueTokensAccrued.value, contract.decimals)
	balance.deficitExact          = deficitOf.reverted        ? null : deficitOf.value
	balance.deficit               = deficitOf.reverted        ? null : decimals.toDecimals(deficitOf.value, contract.decimals)
	balance.save()
}

export function handleTransfer(event: TransferEvent): void {
	if (event.params.from != constants.ADDRESS_ZERO) {
		update(event.address, event.params.from)
	}
	if (event.params.to != constants.ADDRESS_ZERO) {
		update(event.address, event.params.to)
	}
}
