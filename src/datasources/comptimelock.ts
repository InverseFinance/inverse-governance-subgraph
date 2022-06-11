import {
	Address,
} from '@graphprotocol/graph-ts'

import {
	Timelock,
	TimelockTransaction,
	TimelockTransactionQueued,
	TimelockTransactionExecuted,
	TimelockTransactionCanceled,
	TimelockNewDelay,
} from '../../generated/schema'

import {
	CompTimelock,
	QueueTransaction   as QueueTransactionEvent,
	ExecuteTransaction as ExecuteTransactionEvent,
	CancelTransaction  as CancelTransactionEvent,
	NewDelay           as NewDelayEvent,
} from '../../generated/comptimelock/CompTimelock'

import {
	decimals,
	events,
	transactions,
} from '@amxx/graphprotocol-utils'

import {
	fetchAccount,
} from '@openzeppelin/subgraphs/src/fetch/account'

export function fetchTimelock(address: Address): Timelock {
	let timelock = Timelock.load(address)

	if (timelock == null) {
		timelock           = new Timelock(address)
		timelock.delay     = CompTimelock.bind(address).delay()
		timelock.asAccount = address
		timelock.save()

		let account        = fetchAccount(address)
		account.asTimelock = address
		account.save()
	}

	return timelock as Timelock
}

export function handleQueueTransaction(event: QueueTransactionEvent): void {
	let timelock    = fetchTimelock(event.address)
	let operationId = timelock.id.toHex().concat('/').concat(event.params.txHash.toHex())
	let operation   = TimelockTransaction.load(operationId)

	if (operation == null) {
		operation           = new TimelockTransaction(operationId)
		operation.timelock  = timelock.id
		operation.target    = fetchAccount(event.params.target).id
		operation.value     = decimals.toDecimals(event.params.value)
		operation.signature = event.params.signature
		operation.data      = event.params.data
		operation.eta       = event.params.eta
	}
	operation.status = "QUEUED"
	operation.save()

	let ev         = new TimelockTransactionQueued(events.id(event))
	ev.emitter     = timelock.id
	ev.transaction = transactions.log(event).id
	ev.timestamp   = event.block.timestamp
	ev.timelock    = timelock.id
	ev.operation   = operation.id
	ev.save()
}

export function handleExecuteTransaction(event: ExecuteTransactionEvent): void {
	let timelock    = fetchTimelock(event.address)
	let operationId = timelock.id.toHex().concat('/').concat(event.params.txHash.toHex())
	let operation   = TimelockTransaction.load(operationId)

	if (operation == null) {
		operation           = new TimelockTransaction(operationId)
		operation.timelock  = timelock.id
		operation.target    = fetchAccount(event.params.target).id
		operation.value     = decimals.toDecimals(event.params.value)
		operation.signature = event.params.signature
		operation.data      = event.params.data
		operation.eta       = event.params.eta
	}
	operation.status = "EXECUTED"
	operation.save()

	let ev         = new TimelockTransactionExecuted(events.id(event))
	ev.emitter     = timelock.id
	ev.transaction = transactions.log(event).id
	ev.timestamp   = event.block.timestamp
	ev.timelock    = timelock.id
	ev.operation   = operation.id
	ev.save()
}

export function handleCancelTransaction(event: CancelTransactionEvent): void {
	let timelock    = fetchTimelock(event.address)
	let operationId = timelock.id.toHex().concat('/').concat(event.params.txHash.toHex())
	let operation   = TimelockTransaction.load(operationId)

	if (operation == null) {
		operation           = new TimelockTransaction(operationId)
		operation.timelock  = timelock.id
		operation.target    = fetchAccount(event.params.target).id
		operation.value     = decimals.toDecimals(event.params.value)
		operation.signature = event.params.signature
		operation.data      = event.params.data
		operation.eta       = event.params.eta
	}
	operation.status = "CANCELED"
	operation.save()

	let ev         = new TimelockTransactionCanceled(events.id(event))
	ev.emitter     = timelock.id
	ev.transaction = transactions.log(event).id
	ev.timestamp   = event.block.timestamp
	ev.timelock    = timelock.id
	ev.operation   = operation.id
	ev.save()
}

export function handleNewDelay(event: NewDelayEvent): void {
	let timelock   = fetchTimelock(event.address)
	timelock.delay = event.params.newDelay
	timelock.save()

	let ev         = new TimelockNewDelay(events.id(event))
	ev.emitter     = timelock.id
	ev.transaction = transactions.log(event).id
	ev.timestamp   = event.block.timestamp
	ev.timelock    = timelock.id
	ev.delay       = event.params.newDelay
	ev.save()
}
