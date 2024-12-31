const {task} = require("hardhat/config");

task("mint-nft").setAction(async (taskArgs, hre) => {
  const {firstAccount} = await getNamedAccounts()
  const signer = await ethers.getSigner(firstAccount)
  const myTokenDeployment = await hre.deployments.get("MyToken")
  const nft = await ethers.getContractAt("MyToken", myTokenDeployment.address, signer)

  const mintTx = await nft.safeMint(firstAccount)
  mintTx.wait(6)
  console.log("nft minted")
})

module.exports = {}
