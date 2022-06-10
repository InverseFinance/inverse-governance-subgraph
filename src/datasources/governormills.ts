import {
	Address,
} from '@graphprotocol/graph-ts'

import {
	Governor,
	ProposalThresholdUpdated,
	QuorumUpdated,
} from '../../generated/schema'

import {
	GovernorMills,
	ProposalCreated          as ProposalCreatedEvent,
	ProposalThresholdUpdated as ProposalThresholdUpdatedEvent,
	QuorumUpdated            as QuorumUpdatedEvent,
} from '../../generated/governormills/GovernorMills'

import {
	fetchAccount,
} from '@openzeppelin/subgraphs/src/fetch/account'

import {
	events,
	transactions,
} from '@amxx/graphprotocol-utils'

export function fetchGovernorMills(address: Address): Governor {
	let governor = Governor.load(address)

	if (governor == null) {
		let contract = GovernorMills.bind(address)
		governor                   = new Governor(address)
		governor.asAccount         = address
		governor.name              = contract.name();
		governor.timelock          = fetchAccount(contract.timelock()).id;
		governor.votingDelay       = contract.votingDelay();
		governor.votingPeriod      = contract.votingPeriod();
		governor.proposalThreshold = contract.proposalThreshold()
		governor.quorum            = contract.quorumVotes()
		governor.save()

		let account        = fetchAccount(address)
		account.asGovernor = address
		account.save()
	}

	return governor as Governor
}

export function handleProposalCreated(event: ProposalCreatedEvent): void {
	fetchGovernorMills(event.address)
}

export function handleProposalThresholdUpdated(event: ProposalThresholdUpdatedEvent): void {
	let governor = fetchGovernorMills(event.address)
	governor.proposalThreshold = event.params.newThreshold
	governor.save()

	let ev          = new ProposalThresholdUpdated(events.id(event))
	ev.emitter      = governor.id
	ev.transaction  = transactions.log(event).id
	ev.timestamp    = event.block.timestamp
	ev.governor     = governor.id
	ev.oldThreshold = event.params.oldThreshold
	ev.newThreshold = event.params.newThreshold
	ev.save()
}

export function handleQuorumUpdated(event: QuorumUpdatedEvent): void {
	let governor = fetchGovernorMills(event.address)
	governor.quorum = event.params.newQuorum
	governor.save()

	let ev         = new QuorumUpdated(events.id(event))
	ev.emitter     = governor.id
	ev.transaction = transactions.log(event).id
	ev.timestamp   = event.block.timestamp
	ev.governor    = governor.id
	ev.oldQuorum   = event.params.oldQuorum
	ev.newQuorum   = event.params.newQuorum
	ev.save()
}
