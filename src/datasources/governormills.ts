import {
	Address,
} from '@graphprotocol/graph-ts'

import {
	Governor,
	VoteCast,
	ProposalThresholdUpdated,
	QuorumUpdated,
} from '../../generated/schema'

import {
	GovernorMills,
	ProposalCreated          as ProposalCreatedEvent,
	VoteCast                 as VoteCastEvent,
	ProposalThresholdUpdated as ProposalThresholdUpdatedEvent,
	QuorumUpdated            as QuorumUpdatedEvent,
} from '../../generated/governormills/GovernorMills'

import {
	fetchAccount,
} from '@openzeppelin/subgraphs/src/fetch/account'

import {
	fetchGovernor,
	fetchProposal,
	fetchProposalSupport,
	fetchVoteReceipt,
} from '@openzeppelin/subgraphs/src/fetch/governor'

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

export function handleVoteCast(event: VoteCastEvent): void {
	let governor = fetchGovernor(event.address)

	let proposal = fetchProposal(governor, event.params.proposalId)

	let support  = fetchProposalSupport(proposal, event.params.support)
	support.save()

	let receipt  = fetchVoteReceipt(proposal, event.params.voter)
	receipt.support = support.id
	receipt.weight  = event.params.votes
	receipt.reason  = ""
	receipt.save()

	let ev         = new VoteCast(events.id(event))
	ev.emitter     = governor.id
	ev.transaction = transactions.log(event).id
	ev.timestamp   = event.block.timestamp
	ev.governor    = governor.id
	ev.proposal    = receipt.proposal
	ev.support     = receipt.support
	ev.receipt     = receipt.id
	ev.voter       = receipt.voter
	ev.save()
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
