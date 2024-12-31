const { task } = require("hardhat/config");
const { networkConfig } = require("../helper-hardhat-config");

task("burn-and-cross")
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
          "NFTPoolLockAndRelease",
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
    const nftBurnAndMintDeployment =
      await deployments.get("NFTPoolBurnAndMint");
    const nftBurnAndMint = await ethers.getContractAt(
      "NFTPoolBurnAndMint",
      nftBurnAndMintDeployment.address,
      signer,
    );

    // transfer 10 link token
    const transferTx = await linkToken.transfer(
      nftBurnAndMint.target,
      ethers.parseEther("10"),
    );
    await transferTx.wait(6);
    const balance = await linkToken.balanceOf(nftBurnAndMint.target);
    console.log(`balance of pool is ${balance}`);

    // approve pool address to call transferFrom
    const wnftDevelopment = await deployments.get("WrappedNFT");
    const wnft = await ethers.getContractAt(
      "WrappedNFT",
      wnftDevelopment.address,
      signer,
    );
    await wnft.approve(nftBurnAndMint.target, tokenId);
    console.log("approve success");

    // call burnAndMintNFT
    const burnAndMintNFTtx = await nftBurnAndMint.burnAndMint(
      tokenId,
      firstAccount,
      chainSelector,
      receiver,
    );
    console.log(
      `ccip transaction is sent, the tx hash is ${burnAndMintNFTtx.hash}`,
    );
  });

module.exports = {};
