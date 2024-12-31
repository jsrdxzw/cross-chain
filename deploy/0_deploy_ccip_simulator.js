const {developmentChains} = require("../helper-hardhat-config");
const {network} = require("hardhat");
module.exports = async ({getNamedAccounts, deployments}) => {
  if (developmentChains.includes(network.name)) {
    const {firstAccount} = await getNamedAccounts()
    const {deploy, log} = deployments
    log("Deploying CCIPLocalSimulator contract")
    await deploy("CCIPLocalSimulator", {
      contract: "CCIPLocalSimulator",
      from: firstAccount,
      log: true,
      args: []
    })
    log("CCIPLocalSimulator contract deployed successfully")
  }
}

module.exports.tags = ["test", "all"]
