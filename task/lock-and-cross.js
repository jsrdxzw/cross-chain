const { task } = require("hardhat/config");
const { networkConfig } = require("../helper-hardhat-config");

task("lock-and-cross")
  .addOptionalParam("chainselector", "chain selector of dest chain")
  .addOptionalParam("receiver", "receiver address on dest chain")
  .addParam("tokenid", "token ID to be crossed chain")
  .setAction(async (taskArgs, hre) => {
    const chainSelector =
      taskArgs.chainselector ||
      networkConfig[network.config.chainId].companionChainSelector;
    const receiver =
      taskArgs.receiver ||
      (
        await hre.companionNetworks["destChain"].deployments.get(
          "NFTPoolBurnAndMint",
        )
      ).address;
    const tokenId = taskArgs.tokenid;
    const { firstAccount } = await getNamedAccounts();
    const signer = await ethers.getSigner(firstAccount);

    console.log(`chainSelector is ${chainSelector}`);
    console.log(`receiver is ${receiver}`);
    // transfer link token to address of pool
    const linkTokenAddr = networkConfig[network.config.chainId].linkToken;
    const linkToken = await ethers.getContractAt("LinkToken", linkTokenAddr);
    const nftPoolLockAndReleaseDeployment = await deployments.get(
      "NFTPoolLockAndRelease",
    );
    const nftPoolLockAndRelease = await ethers.getContractAt(
      "NFTPoolLockAndRelease",
      nftPoolLockAndReleaseDeployment.address,
      signer,
    );

    // transfer 10 link token
    const transferTx = await linkToken.transfer(
      nftPoolLockAndRelease.target,
      ethers.parseEther("10"),
    );
    await transferTx.wait(6);
    const balance = await linkToken.balanceOf(nftPoolLockAndRelease.target);
    console.log(`balance of pool is ${balance}`);

    // approve pool address to call transferFrom
    const nftDevelopment = await deployments.get("MyToken");
    const nft = await ethers.getContractAt(
      "MyToken",
      nftDevelopment.address,
      signer,
    );
    await nft.approve(nftPoolLockAndRelease.target, tokenId);
    console.log("approve success");

    // call lockAndSendNFT
    const lockAndSendNFTtx = await nftPoolLockAndRelease.lockAndSendNFT(
      tokenId,
      firstAccount,
      chainSelector,
      receiver,
    );
    console.log(
      `ccip transaction is sent, the tx hash is ${lockAndSendNFTtx.hash}`,
    );
  });

module.exports = {};
