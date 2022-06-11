import {
	ERC20Transfer,
	Mint,
	Redeem,
} from '../../generated/schema'

import {
	Mint   as MintEvent,
	Redeem as RedeemEvent,
} from '../../generated/xinv/XINV'

import {
	Transfer as TransferEvent,
} from '@openzeppelin/subgraphs/generated/erc20/IERC20'

import {
	fetchAccount,
} from '@openzeppelin/subgraphs/src/fetch/account'

import {
	fetchERC20,
	fetchERC20Balance,
} from '@openzeppelin/subgraphs/src/fetch/erc20'

import {
	decimals,
	events,
	transactions,
} from '@amxx/graphprotocol-utils'

export function handleTransfer(event: TransferEvent): void {
	let contract   = fetchERC20(event.address)
	let ev         = new ERC20Transfer(events.id(event))
	ev.emitter     = contract.id
	ev.transaction = transactions.log(event).id
	ev.timestamp   = event.block.timestamp
	ev.contract    = contract.id
	ev.value       = decimals.toDecimals(event.params.value, contract.decimals)
	ev.valueExact  = event.params.value

	if (event.params.from == event.address) {
		let totalSupply        = fetchERC20Balance(contract, null)
		totalSupply.valueExact = totalSupply.valueExact.plus(event.params.value)
		totalSupply.value      = decimals.toDecimals(totalSupply.valueExact, contract.decimals)
		totalSupply.save()
	} else {
		let from               = fetchAccount(event.params.from)
		let balance            = fetchERC20Balance(contract, from)
		balance.valueExact     = balance.valueExact.minus(event.params.value)
		balance.value          = decimals.toDecimals(balance.valueExact, contract.decimals)
		balance.save()

		ev.from                = from.id
		ev.fromBalance         = balance.id
	}

	if (event.params.to == event.address) {
		let totalSupply        = fetchERC20Balance(contract, null)
		totalSupply.valueExact = totalSupply.valueExact.minus(event.params.value)
		totalSupply.value      = decimals.toDecimals(totalSupply.valueExact, contract.decimals)
		totalSupply.save()
	} else {
		let to                 = fetchAccount(event.params.to)
		let balance            = fetchERC20Balance(contract, to)
		balance.valueExact     = balance.valueExact.plus(event.params.value)
		balance.value          = decimals.toDecimals(balance.valueExact, contract.decimals)
		balance.save()

		ev.to                  = to.id
		ev.toBalance           = balance.id
	}
	ev.save()
}

export function handleMint(event: MintEvent): void {
	let ev             = new Mint(events.id(event))
	ev.emitter         = event.address
	ev.transaction     = transactions.log(event).id
	ev.timestamp       = event.block.timestamp
	ev.contract        = fetchERC20(event.address).id
	ev.minter          = fetchAccount(event.params.minter).id
	ev.mintAmountExact = event.params.mintAmount
	ev.mintAmount      = decimals.toDecimals(event.params.mintAmount)
	ev.mintTokensExact = event.params.mintTokens
	ev.mintTokens      = decimals.toDecimals(event.params.mintTokens)
	ev.save()
}

export function handleRedeem(event: RedeemEvent): void {
	let ev               = new Redeem(events.id(event))
	ev.emitter           = event.address
	ev.transaction       = transactions.log(event).id
	ev.timestamp         = event.block.timestamp
	ev.contract          = fetchERC20(event.address).id
	ev.redeemer          = fetchAccount(event.params.redeemer).id
	ev.redeemAmountExact = event.params.redeemAmount
	ev.redeemAmount      = decimals.toDecimals(event.params.redeemAmount)
	ev.redeemTokensExact = event.params.redeemTokens
	ev.redeemTokens      = decimals.toDecimals(event.params.redeemTokens)
	ev.save()
}
