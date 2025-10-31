const hre = require('hardhat');
const { ethers, artifacts, network } = hre;

const HEDERA_ACCOUNT_SERVICE = '0x000000000000000000000000000000000000016a';
const HEDERA_TOKEN_SERVICE = '0x0000000000000000000000000000000000000167';
const HAS_ABI = [
  'function hbarApprove(address owner,address spender,int256 amount) returns (int64)',
  'function hbarAllowance(address owner,address spender) view returns (int64,int256)',
  'function cryptoTransfer((address accountID,int64 amount,bool isApproval)[] hbarTransfers,(address token,(address accountID,int64 amount,bool isApproval)[] transfers,(address senderAccountID,address receiverAccountID,int64 serialNumber,bool isApproval)[] nftTransfers)[] tokenTransfers) returns (int64)',
];

const INT64_MAX = (1n << 63n) - 1n;
const TRANSFER_AMOUNT = 1_000_000n; // 0.01 HBAR in tinybars (assuming 8 decimals)
const RECIPIENT = '0x78086a834b6fa4d716a52a0f3fb451a9dab4138c';

async function ensureMockPrecompile(signer) {
  const mockArtifact = await artifacts.readArtifact('MockHederaTokenService');
  await network.provider.send('hardhat_setCode', [
    HEDERA_TOKEN_SERVICE,
    mockArtifact.deployedBytecode,
  ]);
  const mock = await ethers.getContractAt(
    'MockHederaTokenService',
    HEDERA_TOKEN_SERVICE,
    signer
  );
  await mock.setHbarBalance(signer.address, Number(TRANSFER_AMOUNT * 10n));
  return mock;
}

async function main() {
  const [owner, spender] = await ethers.getSigners();

  console.log('Owner:', owner.address);
  console.log('Spender:', spender.address);
  console.log('Recipient:', RECIPIENT);
  console.log('Network:', network.name);

  let has;
  let supportsPrecompileCalls = true;
  if (network.name === 'hardhat') {
    const mock = await ensureMockPrecompile(owner);
    has = await ethers.getContractAt(
      'MockHederaTokenService',
      HEDERA_TOKEN_SERVICE,
      owner
    );
    await mock.setHbarBalance(owner.address, Number(TRANSFER_AMOUNT * 20n));
    await mock.setHbarAllowance(
      owner.address,
      spender.address,
      Number(TRANSFER_AMOUNT * 20n)
    );
    supportsPrecompileCalls = false;
  } else {
    has = new ethers.Contract(HEDERA_ACCOUNT_SERVICE, HAS_ABI, owner);
  }

  const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
  const recipientBalanceBefore = await ethers.provider.getBalance(RECIPIENT);
  console.log('Owner balance before (wei):', ownerBalanceBefore.toString());
  console.log(
    'Recipient balance before (wei):',
    recipientBalanceBefore.toString()
  );

  console.log('Approving allowance...');
  if (supportsPrecompileCalls) {
    const approveTx = await has
      .connect(owner)
      .hbarApprove(owner.address, spender.address, INT64_MAX);
    await approveTx.wait();

    const allowance = await has
      .connect(owner)
      .hbarAllowance(owner.address, spender.address);
    console.log(
      'Allowance response:',
      allowance[0].toString(),
      'amount:',
      allowance[1].toString()
    );
  } else {
    console.log('Mock allowance configured locally');
  }

  console.log('Spender initiating cryptoTransfer...');
  const spenderHas = has.connect(spender);
  const transferTx = await spenderHas.cryptoTransfer(
    [
      {
        accountID: owner.address,
        amount: -Number(TRANSFER_AMOUNT),
        isApproval: true,
      },
      {
        accountID: RECIPIENT,
        amount: Number(TRANSFER_AMOUNT),
        isApproval: false,
      },
    ],
    []
  );
  const receipt = await transferTx.wait();
  console.log('cryptoTransfer tx hash:', receipt.hash);

  const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
  const recipientBalanceAfter = await ethers.provider.getBalance(RECIPIENT);
  console.log('Owner balance after (wei):', ownerBalanceAfter.toString());
  console.log(
    'Recipient balance after (wei):',
    recipientBalanceAfter.toString()
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
