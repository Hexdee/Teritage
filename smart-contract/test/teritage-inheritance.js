const { expect } = require("chai");
const { ethers, artifacts, network } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const ONE_DAY = 24 * 60 * 60;
const HEDERA_PRECOMPILE = "0x0000000000000000000000000000000000000167";
const ZERO_ADDRESS = ethers.ZeroAddress;
const ZERO_HASH = ethers.ZeroHash;
const noSecrets = (count) => Array(count).fill(ZERO_HASH);
const hashAnswer = (answer) => ethers.keccak256(ethers.toUtf8Bytes(answer.trim().toLowerCase()));
const randomWords = (count) => {
  const bank = [
    "amber",
    "river",
    "cobalt",
    "fog",
    "quiet",
    "ember",
    "forest",
    "lumen",
    "orbit",
    "terra",
    "zephyr",
    "mosaic",
  ];
  return Array.from({ length: count }, (_, i) => `${bank[(i * 3) % bank.length]} ${bank[(i * 7 + 2) % bank.length]}`);
};
const WEI_PER_TINYBAR = 10_000_000_000n;

async function setNativeTinybarBalance(address, tinybars) {
  const tinybarBigInt = typeof tinybars === "bigint" ? tinybars : BigInt(tinybars);
  const weiAmount = tinybarBigInt * WEI_PER_TINYBAR;
  await network.provider.send("hardhat_setBalance", [address, ethers.toBeHex(weiAmount)]);
}

async function setupHtsPrecompile() {
  const artifact = await artifacts.readArtifact("MockHederaTokenService");
  await network.provider.send("hardhat_setCode", [HEDERA_PRECOMPILE, artifact.deployedBytecode]);
  return ethers.getContractAt("MockHederaTokenService", HEDERA_PRECOMPILE);
}

async function deployFixture() {
  const [owner, inheritorA, inheritorB, outsider, relayer] = await ethers.getSigners();

  const tokenA = await ethers.deployContract("MockERC20", ["Teritage Token", "TGT"]);
  await tokenA.waitForDeployment();

  const tokenB = await ethers.deployContract("MockERC20", ["Backup Token", "BKT"]);
  await tokenB.waitForDeployment();

  const erc20Amount = ethers.parseUnits("1000", 18);
  await tokenA.mint(owner.address, erc20Amount);

  const hts = await setupHtsPrecompile();
  const htsToken = ethers.Wallet.createRandom().address;

  await hts.configureToken(htsToken, true);
  await hts.setAssociation(htsToken, owner.address, true);
  await hts.setAssociation(htsToken, inheritorA.address, true);
  await hts.setAssociation(htsToken, inheritorB.address, true);

  const htsBalance = 10_000n;
  await hts.setBalance(htsToken, owner.address, Number(htsBalance));

  const teritage = await ethers.deployContract("TeritageInheritance");
  await teritage.waitForDeployment();

  return {
    owner,
    inheritorA,
    inheritorB,
    outsider,
    relayer,
    tokenA,
    tokenB,
    erc20Amount,
    teritage,
    hts,
    htsToken,
    htsBalance,
  };
}

describe("TeritageInheritance", function () {
  it("creates a plan with inheritors, tokens, and token types", async function () {
    const { owner, inheritorA, inheritorB, tokenA, teritage, htsToken } = await loadFixture(deployFixture);

    const tokens = [await tokenA.getAddress(), htsToken, ZERO_ADDRESS];
    const tokenTypes = [0, 1, 2];

    await teritage
      .connect(owner)
      .createPlan([inheritorA.address, inheritorB.address], [6000, 4000], noSecrets(2), tokens, tokenTypes, ONE_DAY);

    const plan = await teritage.getPlan(owner.address);
    expect(plan[0]).to.deep.equal([inheritorA.address, inheritorB.address]);
    expect(plan[1].map(Number)).to.deep.equal([6000, 4000]);
    expect(plan[2]).to.deep.equal(tokens);
    expect(plan[3].map(Number)).to.deep.equal(tokenTypes);
    expect(plan[4]).to.equal(ONE_DAY);
    expect(plan[7]).to.equal(true); // exists flag
  });

  it("allows updates to inheritors and tokens", async function () {
    const { owner, inheritorA, inheritorB, tokenA, tokenB, teritage, htsToken } = await loadFixture(deployFixture);

    await teritage
      .connect(owner)
      .createPlan(
        [inheritorA.address, inheritorB.address],
        [6000, 4000],
        noSecrets(2),
        [await tokenA.getAddress(), htsToken],
        [0, 1],
        ONE_DAY
      );

    await teritage
      .connect(owner)
      .updateInheritors([inheritorB.address, inheritorA.address], [3000, 7000]);

    await teritage
      .connect(owner)
      .updateTokens([await tokenA.getAddress(), await tokenB.getAddress(), ZERO_ADDRESS], [0, 0, 2]);

    const plan = await teritage.getPlan(owner.address);
    expect(plan[0]).to.deep.equal([inheritorB.address, inheritorA.address]);
    expect(plan[1].map(Number)).to.deep.equal([3000, 7000]);
    const returnedTokens = Array.from(plan[2]);
    expect(returnedTokens).to.have.members([await tokenA.getAddress(), await tokenB.getAddress(), ZERO_ADDRESS]);
    const returnedTypes = plan[3].map(Number);
    expect(returnedTypes).to.have.members([0, 0, 2]);
  });

  it("prevents claims before the check-in interval elapses", async function () {
    const { owner, inheritorA, inheritorB, tokenA, teritage } = await loadFixture(deployFixture);

    await teritage
      .connect(owner)
      .createPlan(
        [inheritorA.address, inheritorB.address],
        [5000, 5000],
        noSecrets(2),
        [await tokenA.getAddress()],
        [0],
        ONE_DAY
      );

    await tokenA.connect(owner).approve(await teritage.getAddress(), ethers.MaxUint256);

    await expect(teritage.connect(inheritorA).claimInheritance(owner.address)).to.be.revertedWithCustomError(
      teritage,
      "ClaimNotAvailable"
    );

    await time.increase(ONE_DAY + 1);

    await expect(teritage.connect(inheritorA).claimInheritance(owner.address)).to.not.be.reverted;
  });

  it("distributes ERC-20, HTS, and HBAR balances via inheritor-initiated claim (pull model)", async function () {
    const { owner, inheritorA, inheritorB, tokenA, teritage, erc20Amount, hts, htsToken, htsBalance } =
      await loadFixture(deployFixture);

    const hbarBalance = 50_000n;
    const hbarBalanceWei = hbarBalance * WEI_PER_TINYBAR;

    await teritage
      .connect(owner)
      .createPlan(
        [inheritorA.address, inheritorB.address],
        [6000, 4000],
        noSecrets(2),
        [await tokenA.getAddress(), htsToken, ZERO_ADDRESS],
        [0, 1, 2],
        ONE_DAY
      );

    await tokenA.connect(owner).approve(await teritage.getAddress(), ethers.MaxUint256);
    await hts.setAllowance(htsToken, owner.address, await teritage.getAddress(), Number(htsBalance));
    await hts.setHbarBalance(owner.address, hbarBalanceWei);
    await hts.setHbarAllowance(owner.address, await teritage.getAddress(), hbarBalanceWei);
    await setNativeTinybarBalance(owner.address, hbarBalance);

    await time.increase(ONE_DAY + 5);

    await teritage.connect(inheritorA).claimInheritance(owner.address);

    const inheritorAErc20 = await tokenA.balanceOf(inheritorA.address);
    const inheritorBErc20 = await tokenA.balanceOf(inheritorB.address);

    const expectedAErc20 = (erc20Amount * 6000n) / 10000n;
    const expectedBErc20 = erc20Amount - expectedAErc20;

    expect(inheritorAErc20).to.equal(expectedAErc20);
    expect(inheritorBErc20).to.equal(expectedBErc20);

    const inheritorAHts = await hts.getTokenBalance(htsToken, inheritorA.address);
    const inheritorBHts = await hts.getTokenBalance(htsToken, inheritorB.address);
    const expectedAHts = (htsBalance * 6000n) / 10000n;
    const expectedBHts = htsBalance - expectedAHts;

    expect(inheritorAHts).to.equal(Number(expectedAHts));
    expect(inheritorBHts).to.equal(Number(expectedBHts));

    const inheritorAHbar = await hts.getAccountBalance(inheritorA.address);
    const inheritorBHbar = await hts.getAccountBalance(inheritorB.address);
    const expectedAHbar = (hbarBalanceWei * 6000n) / 10000n;
    const expectedBHbar = hbarBalanceWei - expectedAHbar;

    expect(inheritorAHbar).to.equal(expectedAHbar);
    expect(inheritorBHbar).to.equal(expectedBHbar);

    const plan = await teritage.getPlan(owner.address);
    expect(plan[6]).to.equal(true); // isClaimed

    await expect(teritage.connect(inheritorB).claimInheritance(owner.address)).to.be.revertedWithCustomError(
      teritage,
      "PlanAlreadyClaimed"
    );
  });

  it("allows third parties to trigger distribution once overdue (push model)", async function () {
    const { owner, inheritorA, inheritorB, outsider, tokenA, teritage, erc20Amount, hts, htsToken, htsBalance } =
      await loadFixture(deployFixture);

    const hbarBalance = 75_000n;
    const hbarBalanceWei = hbarBalance * WEI_PER_TINYBAR;

    await teritage
      .connect(owner)
      .createPlan(
        [inheritorA.address, inheritorB.address],
        [6000, 4000],
        noSecrets(2),
        [await tokenA.getAddress(), htsToken, ZERO_ADDRESS],
        [0, 1, 2],
        ONE_DAY
      );

    await tokenA.connect(owner).approve(await teritage.getAddress(), ethers.MaxUint256);
    await hts.setAllowance(htsToken, owner.address, await teritage.getAddress(), Number(htsBalance));
    await hts.setHbarBalance(owner.address, hbarBalanceWei);
    await hts.setHbarAllowance(owner.address, await teritage.getAddress(), hbarBalanceWei);
    await setNativeTinybarBalance(owner.address, hbarBalance);

    await time.increase(ONE_DAY + 10);

    await expect(teritage.connect(outsider).claimInheritance(owner.address)).to.not.be.reverted;

    const expectedAErc20 = (erc20Amount * 6000n) / 10000n;
    const expectedBErc20 = erc20Amount - expectedAErc20;
    expect(await tokenA.balanceOf(inheritorA.address)).to.equal(expectedAErc20);
    expect(await tokenA.balanceOf(inheritorB.address)).to.equal(expectedBErc20);

    const inheritorAHts = await hts.getTokenBalance(htsToken, inheritorA.address);
    const inheritorBHts = await hts.getTokenBalance(htsToken, inheritorB.address);
    const expectedAHts = (htsBalance * 6000n) / 10000n;
    const expectedBHts = htsBalance - expectedAHts;
    expect(inheritorAHts).to.equal(Number(expectedAHts));
    expect(inheritorBHts).to.equal(Number(expectedBHts));

    const inheritorAHbar = await hts.getAccountBalance(inheritorA.address);
    const inheritorBHbar = await hts.getAccountBalance(inheritorB.address);
    const expectedAHbar = (hbarBalanceWei * 6000n) / 10000n;
    const expectedBHbar = hbarBalanceWei - expectedAHbar;
    expect(inheritorAHbar).to.equal(expectedAHbar);
    expect(inheritorBHbar).to.equal(expectedBHbar);

    const plan = await teritage.getPlan(owner.address);
    expect(plan[6]).to.equal(true);
  });

  it("allows share totals below 100% and preserves the owner's remainder", async function () {
    const { owner, inheritorA, inheritorB, tokenA, teritage, erc20Amount } = await loadFixture(deployFixture);

    await teritage
      .connect(owner)
      .createPlan(
        [inheritorA.address, inheritorB.address],
        [3000, 2000],
        noSecrets(2),
        [await tokenA.getAddress()],
        [0],
        ONE_DAY
      );

    const distributable = (erc20Amount * 5000n) / 10000n;
    await tokenA.connect(owner).approve(await teritage.getAddress(), distributable);

    await time.increase(ONE_DAY + 5);

    await teritage.connect(inheritorA).claimInheritance(owner.address);

    const expectedA = (erc20Amount * 3000n) / 10000n;
    const expectedB = (erc20Amount * 2000n) / 10000n;
    const ownerBalance = await tokenA.balanceOf(owner.address);
    const inheritorABalance = await tokenA.balanceOf(inheritorA.address);
    const inheritorBBalance = await tokenA.balanceOf(inheritorB.address);

    expect(inheritorABalance).to.equal(expectedA);
    expect(inheritorBBalance).to.equal(expectedB);
    expect(ownerBalance).to.equal(erc20Amount - expectedA - expectedB);
  });

  it("rejects share totals above 100%", async function () {
    const { owner, inheritorA, inheritorB, tokenA, teritage } = await loadFixture(deployFixture);

    await expect(
      teritage
        .connect(owner)
        .createPlan(
          [inheritorA.address, inheritorB.address],
          [7000, 4000],
          noSecrets(2),
          [await tokenA.getAddress()],
          [0],
          ONE_DAY
        )
    ).to.be.revertedWithCustomError(teritage, "InvalidConfiguration");
  });

  it("requires sufficient ERC-20 allowance to cover balances", async function () {
    const { owner, inheritorA, inheritorB, tokenA, teritage, htsToken } = await loadFixture(deployFixture);

    await teritage
      .connect(owner)
      .createPlan(
        [inheritorA.address, inheritorB.address],
        [5000, 5000],
        noSecrets(2),
        [await tokenA.getAddress(), htsToken],
        [0, 1],
        ONE_DAY
      );

    const halfAllowance = ethers.parseUnits("100", 18);
    await tokenA.connect(owner).approve(await teritage.getAddress(), halfAllowance);

    await time.increase(ONE_DAY + 5);

    await expect(
      teritage.connect(inheritorA).claimInheritance(owner.address)
    ).to.be.revertedWithCustomError(teritage, "InsufficientAllowance");
  });

  it("reverts when HTS transfer fails due to missing association", async function () {
    const { owner, inheritorA, inheritorB, teritage, hts, htsToken, htsBalance } = await loadFixture(deployFixture);

    await teritage
      .connect(owner)
      .createPlan(
        [inheritorA.address, inheritorB.address],
        [5000, 5000],
        noSecrets(2),
        [htsToken],
        [1],
        ONE_DAY
      );

    await hts.setAllowance(htsToken, owner.address, await teritage.getAddress(), Number(htsBalance));
    await hts.setAssociation(htsToken, inheritorA.address, false);

    await time.increase(ONE_DAY + 5);

    await expect(teritage.connect(inheritorB).claimInheritance(owner.address))
      .to.be.revertedWithCustomError(teritage, "HederaTokenTransferFailed")
      .withArgs(htsToken, 33);
  });

  it("reverts when HTS allowance is insufficient", async function () {
    const { owner, inheritorA, inheritorB, teritage, hts, htsToken } = await loadFixture(deployFixture);

    await teritage
      .connect(owner)
      .createPlan(
        [inheritorA.address, inheritorB.address],
        [5000, 5000],
        noSecrets(2),
        [htsToken],
        [1],
        ONE_DAY
      );

    await hts.setAllowance(htsToken, owner.address, await teritage.getAddress(), 1);

    await time.increase(ONE_DAY + 5);

    await expect(teritage.connect(inheritorA).claimInheritance(owner.address))
      .to.be.revertedWithCustomError(teritage, "HederaTokenTransferFailed")
      .withArgs(htsToken, 1401);
  });

  it("reverts when HBAR allowance is insufficient", async function () {
    const { owner, inheritorA, inheritorB, teritage, hts } = await loadFixture(deployFixture);

    await teritage
      .connect(owner)
      .createPlan(
        [inheritorA.address, inheritorB.address],
        [5000, 5000],
        noSecrets(2),
        [ZERO_ADDRESS],
        [2],
        ONE_DAY
      );

    const hbarBalance = 1_000n;
    const hbarBalanceWei = hbarBalance * WEI_PER_TINYBAR;

    await hts.setHbarBalance(owner.address, hbarBalanceWei);
    await hts.setHbarAllowance(owner.address, await teritage.getAddress(), 100);
    await setNativeTinybarBalance(owner.address, hbarBalance);

    await time.increase(ONE_DAY + 5);

    await expect(teritage.connect(inheritorA).claimInheritance(owner.address))
      .to.be.revertedWithCustomError(teritage, "HederaTokenTransferFailed")
      .withArgs(ZERO_ADDRESS, 1401);
  });

  it("allows secret-based inheritor resolution before claiming", async function () {
    const { owner, inheritorA, inheritorB, relayer, tokenA, teritage, erc20Amount } =
      await loadFixture(deployFixture);

    await teritage.connect(owner).setRelayer(relayer.address);

    const [secretAnswer] = randomWords(1);
    const secretHash = hashAnswer(secretAnswer);

    await teritage
      .connect(owner)
      .createPlan(
        [ZERO_ADDRESS, inheritorB.address],
        [5000, 5000],
        [secretHash, ZERO_HASH],
        [await tokenA.getAddress()],
        [0],
        ONE_DAY
      );

    await tokenA.connect(owner).approve(await teritage.getAddress(), ethers.MaxUint256);
    await time.increase(ONE_DAY + 5);

    await expect(teritage.connect(inheritorB).claimInheritance(owner.address))
      .to.be.revertedWithCustomError(teritage, "PendingInheritors");

    await expect(
      teritage.connect(relayer).resolveInheritorWithSecret(owner.address, 0, inheritorA.address, secretAnswer)
    ).to.emit(teritage, "InheritorResolved");

    await teritage.connect(inheritorA).claimInheritance(owner.address);

    const expectedA = (erc20Amount * 5000n) / 10000n;
    const expectedB = erc20Amount - expectedA;
    expect(await tokenA.balanceOf(inheritorA.address)).to.equal(expectedA);
    expect(await tokenA.balanceOf(inheritorB.address)).to.equal(expectedB);
  });

  it("rejects pending inheritors without a secret hash", async function () {
    const { owner, tokenA, teritage } = await loadFixture(deployFixture);

    await expect(
      teritage
        .connect(owner)
        .createPlan(
          [ZERO_ADDRESS],
          [10_000],
          [ZERO_HASH],
          [await tokenA.getAddress()],
          [0],
          ONE_DAY
        )
    ).to.be.revertedWithCustomError(teritage, "InvalidConfiguration");
  });

  it("rejects secret hash when inheritor address is provided", async function () {
    const { owner, inheritorA, tokenA, teritage } = await loadFixture(deployFixture);

    const [secretAnswer] = randomWords(1);
    await expect(
      teritage
        .connect(owner)
        .createPlan(
          [inheritorA.address],
          [10_000],
          [hashAnswer(secretAnswer)],
          [await tokenA.getAddress()],
          [0],
          ONE_DAY
        )
    ).to.be.revertedWithCustomError(teritage, "InvalidConfiguration");
  });

  it("allows multiple pending inheritors with distinct secrets", async function () {
    const { owner, tokenA, teritage } = await loadFixture(deployFixture);

    const secretAnswers = randomWords(2);
    await expect(
      teritage
        .connect(owner)
        .createPlan(
          [ZERO_ADDRESS, ZERO_ADDRESS],
          [5000, 5000],
          secretAnswers.map(hashAnswer),
          [await tokenA.getAddress()],
          [0],
          ONE_DAY
        )
    ).to.not.be.reverted;
  });

  it("enforces relayer-only and valid secret resolution", async function () {
    const { owner, inheritorA, inheritorB, outsider, relayer, tokenA, teritage } =
      await loadFixture(deployFixture);

    await teritage.connect(owner).setRelayer(relayer.address);
    const [secretAnswer] = randomWords(1);

    await teritage
      .connect(owner)
      .createPlan(
        [ZERO_ADDRESS, inheritorB.address],
        [5000, 5000],
        [hashAnswer(secretAnswer), ZERO_HASH],
        [await tokenA.getAddress()],
        [0],
        ONE_DAY
      );

    await expect(
      teritage.connect(outsider).resolveInheritorWithSecret(owner.address, 0, inheritorA.address, secretAnswer)
    ).to.be.revertedWithCustomError(teritage, "UnauthorizedRelayer");

    await expect(
      teritage.connect(relayer).resolveInheritorWithSecret(owner.address, 0, inheritorA.address, "wrong")
    ).to.be.revertedWithCustomError(teritage, "InvalidConfiguration");

    await expect(
      teritage.connect(relayer).resolveInheritorWithSecret(owner.address, 0, inheritorB.address, secretAnswer)
    ).to.be.revertedWithCustomError(teritage, "InvalidConfiguration");

    await teritage.connect(relayer).resolveInheritorWithSecret(owner.address, 0, inheritorA.address, secretAnswer);

    await expect(
      teritage.connect(relayer).resolveInheritorWithSecret(owner.address, 0, inheritorA.address, secretAnswer)
    ).to.be.revertedWithCustomError(teritage, "InvalidConfiguration");
  });

});
