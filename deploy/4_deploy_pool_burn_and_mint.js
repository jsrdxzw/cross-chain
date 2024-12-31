const {ethers, network} = require("hardhat");
const {developmentChains, networkConfig} = require("../helper-hardhat-config");
module.exports = async ({getNamedAccounts, deployments}) => {
  const {firstAccount} = await getNamedAccounts()
  const {deploy, log} = deployments

  log("Deploying NFTPoolBurnAndMint contract")

  let destChainRouter, linkTokenAddr
  if (developmentChains.includes(network.name)) {
    const ccipSimulatorDeployment = await deployments.get("CCIPLocalSimulator")
    const ccipSimulator = await ethers.getContractAt("CCIPLocalSimulator", ccipSimulatorDeployment.address)
    const ccipConfig = await ccipSimulator.configuration()
    destChainRouter = ccipConfig.destinationRouter_
    linkTokenAddr = ccipConfig.linkToken_
  } else {
    const networkConf = networkConfig[network.config.chainId]
    destChainRouter = networkConf.router
    linkTokenAddr = networkConf.linkToken
  }

  const wnftDeployment = await deployments.get("WrappedNFT")
  const wnftAddr = wnftDeployment.address

  await deploy("NFTPoolBurnAndMint", {
    contract: "NFTPoolBurnAndMint",
    from: firstAccount,
    log: true,
    args: [destChainRouter, linkTokenAddr, wnftAddr]
  })
  log("NFTPoolBurnAndMint deployed successfully")
}

module.exports.tags = ["destchain", "all"]
