export const abi = [{"type":"constructor","inputs":[{"name":"_userContractAddress","type":"address","internalType":"address"}],"stateMutability":"nonpayable"},{"type":"receive","stateMutability":"payable"},{"type":"function","name":"battles","inputs":[{"name":"","type":"string","internalType":"string"}],"outputs":[{"name":"winningMemeId","type":"uint256","internalType":"uint256"},{"name":"startTime","type":"uint256","internalType":"uint256"},{"name":"deadline","type":"uint256","internalType":"uint256"},{"name":"ended","type":"bool","internalType":"bool"}],"stateMutability":"view"},{"type":"function","name":"createBattle","inputs":[{"name":"battleId","type":"string","internalType":"string"},{"name":"memeNames","type":"string[]","internalType":"string[]"},{"name":"duration","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"declareWinner","inputs":[{"name":"battleId","type":"string","internalType":"string"},{"name":"winningMemeId","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"didReceiveAttestation","inputs":[{"name":"attester","type":"address","internalType":"address"},{"name":"","type":"uint64","internalType":"uint64"},{"name":"attestationId","type":"uint64","internalType":"uint64"},{"name":"","type":"bytes","internalType":"bytes"}],"outputs":[],"stateMutability":"payable"},{"type":"function","name":"didReceiveAttestation","inputs":[{"name":"","type":"address","internalType":"address"},{"name":"","type":"uint64","internalType":"uint64"},{"name":"","type":"uint64","internalType":"uint64"},{"name":"","type":"address","internalType":"contract IERC20"},{"name":"","type":"uint256","internalType":"uint256"},{"name":"","type":"bytes","internalType":"bytes"}],"outputs":[],"stateMutability":"pure"},{"type":"function","name":"didReceiveRevocation","inputs":[{"name":"","type":"address","internalType":"address"},{"name":"","type":"uint64","internalType":"uint64"},{"name":"","type":"uint64","internalType":"uint64"},{"name":"","type":"bytes","internalType":"bytes"}],"outputs":[],"stateMutability":"payable"},{"type":"function","name":"didReceiveRevocation","inputs":[{"name":"","type":"address","internalType":"address"},{"name":"","type":"uint64","internalType":"uint64"},{"name":"","type":"uint64","internalType":"uint64"},{"name":"","type":"address","internalType":"contract IERC20"},{"name":"","type":"uint256","internalType":"uint256"},{"name":"","type":"bytes","internalType":"bytes"}],"outputs":[],"stateMutability":"pure"},{"type":"function","name":"getWinnings","inputs":[{"name":"battleId","type":"string","internalType":"string"},{"name":"user","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"owner","inputs":[],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},{"type":"function","name":"placeBet","inputs":[{"name":"battleId","type":"string","internalType":"string"},{"name":"memeId","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"payable"},{"type":"function","name":"renounceOwnership","inputs":[],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"transferOwnership","inputs":[{"name":"newOwner","type":"address","internalType":"address"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"userContract","inputs":[],"outputs":[{"name":"","type":"address","internalType":"contract User"}],"stateMutability":"view"},{"type":"function","name":"winnings","inputs":[{"name":"","type":"string","internalType":"string"},{"name":"","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"event","name":"BattleCreated","inputs":[{"name":"battleId","type":"string","indexed":false,"internalType":"string"},{"name":"memes","type":"string[]","indexed":false,"internalType":"string[]"},{"name":"startTime","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"deadline","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},{"type":"event","name":"BetPlaced","inputs":[{"name":"battleId","type":"string","indexed":false,"internalType":"string"},{"name":"user","type":"address","indexed":true,"internalType":"address"},{"name":"memeId","type":"uint256","indexed":true,"internalType":"uint256"},{"name":"amount","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},{"type":"event","name":"OwnershipTransferred","inputs":[{"name":"previousOwner","type":"address","indexed":true,"internalType":"address"},{"name":"newOwner","type":"address","indexed":true,"internalType":"address"}],"anonymous":false},{"type":"event","name":"RewardClaimed","inputs":[{"name":"battleId","type":"string","indexed":false,"internalType":"string"},{"name":"user","type":"address","indexed":true,"internalType":"address"},{"name":"reward","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},{"type":"event","name":"UserScoreUpdated","inputs":[{"name":"user","type":"address","indexed":true,"internalType":"address"},{"name":"oldScore","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"newScore","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},{"type":"event","name":"WinnerDeclared","inputs":[{"name":"battleId","type":"string","indexed":false,"internalType":"string"},{"name":"memeId","type":"uint256","indexed":true,"internalType":"uint256"}],"anonymous":false},{"type":"error","name":"OwnableInvalidOwner","inputs":[{"name":"owner","type":"address","internalType":"address"}]},{"type":"error","name":"OwnableUnauthorizedAccount","inputs":[{"name":"account","type":"address","internalType":"address"}]},{"type":"error","name":"ReentrancyGuardReentrantCall","inputs":[]}]

export const contractAddress = "0x26863bc735fc5f29667328cf2eda2e980bf77746";
