module.exports = async ({getNamedAccounts, deployments}) => {
  const {firstAccount} = await getNamedAccounts()
  const {deploy, log} = deployments
  log("Deploying wnft contract")
  await deploy("WrappedNFT", {
    contract: "WrappedNFT",
    from: firstAccount,
    log: true,
    args: ["WrappedNFT", "WNFT"]
  })
  log("wnft contract deployed successfully")
}

module.exports.tags = ["destchain", "all"]
