const {task} = require("hardhat/config");

task("check-wnft").setAction(async (taskArgs, hre) => {
  const wrappedNFTDeployment = await hre.deployments.get("WrappedNFT")
  const wnft = await ethers.getContractAt("WrappedNFT", wrappedNFTDeployment.address)
  const totalSupply = await wnft.totalSupply()
  for (let i = 0; i < totalSupply; i++) {
    const owner = await wnft.ownerOf(i)
    console.log(`TokenId: ${i}, owner: ${owner}`)
  }
})

module.exports = {}
