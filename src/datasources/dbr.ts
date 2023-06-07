import {
	Market,
	NewMarket,
} from '../../generated/schema'

import {
	AddMarket as AddMarketEvent,
} from '../../generated/dbr/DBR'

import {
	market as marketTemplate
} from '../../generated/templates'

import {
	events,
	transactions,
} from '@amxx/graphprotocol-utils'

import {
	fetchAccount,
} from '@openzeppelin/subgraphs/src/fetch/account'

export function handleAddMarket(event: AddMarketEvent): void {
	marketTemplate.create(event.params.market);

	let market = new Market(event.params.market)
	// initialize market ?
	// fetch market ?
	market.save()

	let ev         = new NewMarket(events.id(event))
	ev.emitter     = fetchAccount(event.address).id
	ev.transaction = transactions.log(event).id
	ev.timestamp   = event.block.timestamp
	ev.market      = market.id
	ev.save()
}