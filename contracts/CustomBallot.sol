// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20Votes {
    function getPastVotes(address, uint256) external view returns (uint256);
}

/// @title Custom Ballot
/// @author David Blasco
/// @dev This contract is used to create a custom ballot.
contract CustomBallot is Ownable{
    /// @dev broadcasted event when an user votes
    event Voted(
        address indexed voter,
        uint256 indexed proposal,
        uint256 weight,
        uint256 proposalVotes
    );

    /// @dev Proposal dataType structure
    struct Proposal {
        bytes32 name;
        uint256 voteCount;
    }

    mapping(address => uint256) public spentVotePower;

    Proposal[] public proposals;
    IERC20Votes public voteToken;
    uint256 public referenceBlock;

    /// @dev Constructor of the ballot, require a list with the proposals and the allowed voting contract address.
    constructor(bytes32[] memory proposalNames, address _voteToken) {
        uint256 proposalsLength = proposals.length;
        for (uint256 i = 0; i < proposalsLength; i++) {
            proposals.push(Proposal({name: proposalNames[i], voteCount: 0}));
        }
        voteToken = IERC20Votes(_voteToken);
        referenceBlock = block.number;
    }

    /// @dev Update the reference block for count token balances from that block and onwards.
    function updateReferenceBlock() external onlyOwner {
        referenceBlock = block.number;
    }

    /// @dev Function to vote for a proposal.
    function vote(uint256 proposal, uint256 amount) external {
        uint256 votingPowerAvailable = votingPower();
        require(votingPowerAvailable >= amount, "Has not enough voting power");
        spentVotePower[msg.sender] += amount;
        proposals[proposal].voteCount += amount;
        emit Voted(msg.sender, proposal, amount, proposals[proposal].voteCount);
    }

    /// @dev Function to get the winning proposal.
    function winningProposal() public view returns (uint256 winningProposal_) {
        uint256 winningVoteCount = 0;
        uint256 proposalsLength = proposals.length;
        uint256 voteCount = 0;
        for (uint256 p = 0; p < proposalsLength; p++) {
            voteCount = proposals[p].voteCount;
            if (voteCount > winningVoteCount) {
                winningVoteCount = voteCount;
                winningProposal_ = p;
            }
        }
        return winningProposal_;
    }

    /// @dev Returns the name of the winning proposal.
    function winnerName() external view returns (bytes32 winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }

    /// @dev Returns the voting power of the user.
    function votingPower() public view returns (uint256 votingPower_) {
        votingPower_ =
            voteToken.getPastVotes(msg.sender, referenceBlock) -
            spentVotePower[msg.sender];
    }
}
