const {ethers, network} = require("hardhat");
const {developmentChains, networkConfig} = require("../helper-hardhat-config");
module.exports = async ({getNamedAccounts, deployments}) => {
  const {firstAccount} = await getNamedAccounts()
  const {deploy, log} = deployments

  log("Deploying nft lock and release contract")

  let sourceChainRouter, linkTokenAddr

  if (developmentChains.includes(network.name)) {
    const ccipSimulatorDeployment = await deployments.get("CCIPLocalSimulator")
    const ccipSimulator = await ethers.getContractAt("CCIPLocalSimulator", ccipSimulatorDeployment.address)
    const ccipConfig = await ccipSimulator.configuration()
    sourceChainRouter = ccipConfig.sourceRouter_
    linkTokenAddr = ccipConfig.linkToken_
  } else {
    const networkConf = networkConfig[network.config.chainId]
    sourceChainRouter = networkConf.router
    linkTokenAddr = networkConf.linkToken
  }

  const nftDeployment = await deployments.get("MyToken")
  const nftAddr = nftDeployment.address

  await deploy("NFTPoolLockAndRelease", {
    contract: "NFTPoolLockAndRelease",
    from: firstAccount,
    log: true,
    args: [sourceChainRouter, linkTokenAddr, nftAddr]
  })
  log("nft lock and release contract deployed successfully")
}

module.exports.tags = ["sourcechain", "all"]
