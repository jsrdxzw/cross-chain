const {task} = require("hardhat/config");

task("check-nft").setAction(async (taskArgs, hre) => {
  const myTokenDeployment = await hre.deployments.get("MyToken")
  const nft = await ethers.getContractAt("MyToken", myTokenDeployment.address)
  const totalSupply = await nft.totalSupply()
  for (let i = 0; i < totalSupply; i++) {
    const owner = await nft.ownerOf(i)
    console.log(`TokenId: ${i}, owner: ${owner}`)
  }
})

module.exports = {}
