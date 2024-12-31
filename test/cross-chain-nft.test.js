const {getNamedAccounts, deployments, ethers} = require("hardhat");
const {expect} = require("chai");

let firstAccount, ccipSimulator, nft, nftPoolLockAndRelease, wnft, nftPoolBurnAndMint, chainSelector

before(async () => {
  firstAccount = (await getNamedAccounts()).firstAccount
  const signer = await ethers.getSigner(firstAccount)
  await deployments.fixture(["all"])

  const ccipDeployment = await deployments.get("CCIPLocalSimulator")
  ccipSimulator = await ethers.getContractAt("CCIPLocalSimulator", ccipDeployment.address, signer)

  const nftDeployment = await deployments.get("MyToken")
  nft = await ethers.getContractAt("MyToken", nftDeployment.address, signer)

  const nftPoolLockAndReleaseDeployment = await deployments.get("NFTPoolLockAndRelease")
  nftPoolLockAndRelease = await ethers.getContractAt("NFTPoolLockAndRelease", nftPoolLockAndReleaseDeployment.address, signer)

  const wnftDeployment = await deployments.get("WrappedNFT")
  wnft = await ethers.getContractAt("WrappedNFT", wnftDeployment.address, signer)

  const nftPoolBurnAndMintDeployment = await deployments.get("NFTPoolBurnAndMint")
  nftPoolBurnAndMint = await ethers.getContractAt("NFTPoolBurnAndMint", nftPoolBurnAndMintDeployment.address, signer)

  const ccipConfig = await ccipSimulator.configuration()
  chainSelector = ccipConfig.chainSelector_
})

describe("source chain -> dest chain tests", async () => {
  it('should mint a nft from nft contract successfully', async () => {
    await nft.safeMint(firstAccount)
    const owner = await nft.ownerOf(0)
    expect(owner).to.equal(firstAccount)
  });

  it('should lock the nft and send ccip message on source chain', async () => {
    await nft.approve(nftPoolLockAndRelease.target, 0)
    await ccipSimulator.requestLinkFromFaucet(nftPoolLockAndRelease, ethers.parseEther("10"))
    await nftPoolLockAndRelease.lockAndSendNFT(0, firstAccount, chainSelector, nftPoolBurnAndMint.target)
    const owner = await nft.ownerOf(0)
    expect(owner).to.equal(nftPoolLockAndRelease)
  });

  it('should get a wrapped nft in dest chain', async () => {
    const owner = await wnft.ownerOf(0)
    expect(owner).to.equal(firstAccount)
  });
})

describe("dest chain -> source chain tests", async () => {
  it('should burn the wnft and send ccip message on dest chain', async () => {
    await wnft.approve(nftPoolBurnAndMint.target, 0)
    await ccipSimulator.requestLinkFromFaucet(nftPoolBurnAndMint, ethers.parseEther("10"))
    await nftPoolBurnAndMint.burnAndMint(0, firstAccount, chainSelector, nftPoolLockAndRelease.target)
    const totalSupply = await wnft.totalSupply()
    expect(totalSupply).to.equal(0)
  });

  it('should transferred to firstAccount', async () => {
    const newOwner = await nft.ownerOf(0)
    expect(newOwner).to.equal(firstAccount)
  });
})
