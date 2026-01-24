const hre = require('hardhat');
const { ethers, artifacts, network } = hre;

const HEDERA_TOKEN_SERVICE = '0x0000000000000000000000000000000000000167';
const HEDERA_ACCOUNT_SERVICE = '0x000000000000000000000000000000000000016a';
const ZERO_ADDRESS = ethers.ZeroAddress;
const BENEFICIARY = '0x78086a834b6fa4D716a52A0F3Fb451a9DAB4138c';
const ONE_MINUTE = 60;
const MAX_INT64 = (1n << 63n) - 1n;

async function main() {
  const [deployer, relayer] = await ethers.getSigners();
  console.log('Deployer:', deployer.address);
  console.log('Relayer:', relayer.address);

  const TeritageInheritance = await ethers.getContractFactory(
    'TeritageInheritance'
  );
  const contract = await TeritageInheritance.deploy();
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log('TeritageInheritance deployed to:', contractAddress);

  // Step 1: create plan
  const inheritors = [BENEFICIARY];
  const shares = [8000]; // 80%
  const secretHashes = [ethers.ZeroHash];
  const tokens = [ZERO_ADDRESS]; // HBAR
  const tokenTypes = [2]; // HBAR enum value

  console.log('Creating plan...');
  const createTx = await contract
    .connect(deployer)
    .createPlan(inheritors, shares, secretHashes, tokens, tokenTypes, ONE_MINUTE);
  await createTx.wait();
  console.log('Plan created');

  // Step 2: configure HBAR allowance (mocked on Hardhat network)
  let has;
  if (network.name === 'hardhat') {
    const mockArtifact = await artifacts.readArtifact('MockHederaTokenService');
    await network.provider.send('hardhat_setCode', [
      HEDERA_TOKEN_SERVICE,
      mockArtifact.deployedBytecode,
    ]);
    has = await ethers.getContractAt(
      'MockHederaTokenService',
      HEDERA_TOKEN_SERVICE
    );
    const mockHbarAmount = 5_000_000_000;
    await has.setHbarBalance(deployer.address, mockHbarAmount);
    await has.setHbarAllowance(
      deployer.address,
      contractAddress,
      mockHbarAmount
    );
    const weiBalance =
      BigInt(mockHbarAmount) * 10_000_000_000n + 1_000_000_000_000_000_000n;
    await network.provider.send('hardhat_setBalance', [
      deployer.address,
      ethers.toBeHex(weiBalance),
    ]);
    console.log('Mock HAS configured with balance/allowance:', mockHbarAmount);
  } else {
    const hasAbi = [
      'function hbarApprove(address owner,address spender,int256 amount) returns (int64)',
      'function hbarAllowance(address owner,address spender) view returns (int64,int256)',
    ];
    has = new ethers.Contract(HEDERA_ACCOUNT_SERVICE, hasAbi, deployer);
    console.log('Granting HBAR allowance...');
    const approveTx = await has.hbarApprove(
      deployer.address,
      contractAddress,
      MAX_INT64
    );
    await approveTx.wait();
    const allowance = await has.hbarAllowance(
      deployer.address,
      contractAddress
    );
    console.log(
      'HBAR allowance response:',
      allowance[0].toString(),
      'amount:',
      allowance[1].toString()
    );
  }

  // Step 3: wait for interval to elapse (works on testnet and hardhat)
  const delaySeconds = ONE_MINUTE + 5;
  console.log(`Waiting ${delaySeconds}s for claim to unlock...`);
  await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));

  const beneficiaryBalanceBefore = await ethers.provider.getBalance(
    BENEFICIARY
  );
  console.log(
    'Beneficiary HBAR before (wei):',
    beneficiaryBalanceBefore.toString()
  );

  const ownerBalanceBefore = await ethers.provider.getBalance(deployer.address);
  console.log('Owner HBAR before (wei):', ownerBalanceBefore.toString());

  // Step 4: trigger claim from caller
  console.log('Relayer triggering claim...');
  const claimTx = await contract
    .connect(relayer)
    .claimInheritance(deployer.address);
  const receipt = await claimTx.wait();
  console.log('Claim tx hash:', receipt.hash);

  const ownerBalanceAfter = await ethers.provider.getBalance(deployer.address);
  console.log('Owner HBAR after (wei):', ownerBalanceAfter.toString());

  // Check HBAR balances before/after
  const beneficiaryBalance = await ethers.provider.getBalance(BENEFICIARY);
  console.log('Beneficiary HBAR after (wei):', beneficiaryBalance.toString());
  const received = beneficiaryBalance - beneficiaryBalanceBefore;
  console.log('Beneficiary HBAR received (wei):', received.toString());
  if (network.name === 'hardhat') {
    const mockBalance = await has.getAccountBalance(BENEFICIARY);
    console.log(
      'Mock HTS beneficiary balance (tinybars):',
      mockBalance.toString()
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
