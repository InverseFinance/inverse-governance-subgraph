import { Address } from '@graphprotocol/graph-ts';

import {
	Account,
	BorrowController,
	Market,
} from '../../generated/schema';

import {
	market as marketTemplate,
	borrowcontroller as borrowControllerTemplate,
} from '../../generated/templates';

import {
	Market as MarketContract,
} from '../../generated/templates/market/Market';

import {
	Oracle as OracleContract,
} from '../../generated/templates/market/Oracle';

import {
	BorrowController as BorrowControllerContract,
} from '../../generated/templates/market/BorrowController';

import {
	fetchERC20,
} from '@openzeppelin/subgraphs/src/fetch/erc20'

export function fetchMarket(address: Address): Market {
	let market = Market.load(address)
	let marketContract = MarketContract.bind(address)
	let oracleContract = OracleContract.bind(marketContract.oracle())

	if (market == null) {
		// create template
		marketTemplate.create(address)

		// create object
		market                     = new Market(address)
		market.asAccount           = address
		market.controller          = fetchBorrowController(marketContract.borrowController()).id
		market.collateral          = fetchERC20(marketContract.collateral()).id
		market.collateralFactorBPS = marketContract.collateralFactorBps()
		let dailyLimit             = BorrowControllerContract.bind(Address.fromBytes(market.controller)).try_dailyLimits(address)
		market.dailyLimit          = dailyLimit.reverted ? null : dailyLimit.value
		//market.save() // save after price update

		// register in account
		let account      = new Account(address)
		account.asMarket = address
		account.save()
	}

	let price = oracleContract.try_getFeedPrice(Address.fromBytes(market.collateral))
	market.price = price.reverted ? null : price.value;
	market.save()

	return market as Market
}

export function fetchBorrowController(address: Address): BorrowController {
	let controller = BorrowController.load(address)

	if (controller == null) {
		// create template
		borrowControllerTemplate.create(address)

		// create object
		controller           = new BorrowController(address)
		controller.asAccount = address
		controller.save()

		let account          = new Account(address)
		account.asController = address
		account.save()
	}

	return controller as BorrowController
}
