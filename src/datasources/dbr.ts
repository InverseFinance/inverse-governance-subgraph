import {
	Market,
	NewMarket,
} from '../../generated/schema'

import {
	AddMarket as AddMarketEvent,
} from '../../generated/dbr/DBR'


import {
	events,
	transactions,
} from '@amxx/graphprotocol-utils'

import {
	fetchAccount,
} from '@openzeppelin/subgraphs/src/fetch/account'

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