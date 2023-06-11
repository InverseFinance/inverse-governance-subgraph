import {
    SetDailyLimitCall
} from '../../generated/templates/borrowcontroller/BorrowController'

import {
    fetchMarket,
} from "../fetch/market"

export function handleSetDailyLimit(call: SetDailyLimitCall) : void {
    let market = fetchMarket(call.inputs.market)
    market.dailyLimit = call.inputs.limit
    market.save()
}