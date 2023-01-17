import { expect } from "chai";
import { ethers } from "hardhat";

describe("Outsider", function () {
  async function deployOutsider() {
    const [owner, other] = await ethers.getSigners();

    const Outsider = await ethers.getContractFactory("Outsider");
    const outsider = await Outsider.deploy();

    return { outsider, owner, other };
  }

  async function signWorthy(who: number) {
    const signer = (await ethers.getSigners())[who];
    return signer.signMessage(
      ethers.utils.arrayify(
        ethers.utils.solidityKeccak256(
          ["string"],
          ["I am worthy."]
        )
      )
    );
  }

  async function signUnworthy(who: number) {
    const signer = (await ethers.getSigners())[who];
    return signer.signMessage(
      ethers.utils.arrayify(
        ethers.utils.solidityKeccak256(
          ["string"],
          ["I am unworthy."]
        )
      )
    );
  }

  describe("Deployment", function () {
    it("Should correctly handle submitted proofs", async function () {
      const { outsider, owner, other } = await deployOutsider();

      expect(await outsider.isEOA(owner.address)).to.be.false;
      expect(await outsider.isEOA(other.address)).to.be.false;

      await expect(outsider.proofEOA(owner.address, await signUnworthy(0))).to.be.reverted;
      await expect(outsider.proofEOA(other.address, await signUnworthy(1))).to.be.reverted;

      expect(await outsider.isEOA(owner.address)).to.be.false;
      expect(await outsider.isEOA(other.address)).to.be.false;

      expect(await outsider.proofEOA(owner.address, await signWorthy(0))).to.emit(outsider, "ProofOfEOA");

      expect(await outsider.isEOA(owner.address)).to.be.true;
      expect(await outsider.isEOA(other.address)).to.be.false;

      await expect(outsider.proofEOA(other.address, await signWorthy(0))).to.be.revertedWith("Invalid proof...");

      expect(await outsider.isEOA(owner.address)).to.be.true;
      expect(await outsider.isEOA(other.address)).to.be.false;

      expect(await outsider.proofEOA(other.address, await signWorthy(1))).to.emit(outsider, "ProofOfEOA");

      expect(await outsider.isEOA(owner.address)).to.be.true;
      expect(await outsider.isEOA(other.address)).to.be.true;
    });
  });
});
