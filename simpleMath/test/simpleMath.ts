import { assert, expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("SimpleMath", function () {
  async function deploy() {
    return ethers.deployContract("SimpleMath");
  }

  it("should add two numbers correctly", async function () {
    const simpleMath = await deploy();
    assert.equal(await simpleMath.add(2n, 3n), 5n);
  });

  it("should subtract two numbers correctly", async function () {
    const simpleMath = await deploy();
    assert.equal(await simpleMath.sub(10n, 4n), 6n);
  });

  it("should return a negative result when subtracting a larger number", async function () {
    const simpleMath = await deploy();
    assert.equal(await simpleMath.sub(4n, 10n), -6n);
  });

  it("should multiply two numbers correctly", async function () {
    const simpleMath = await deploy();
    assert.equal(await simpleMath.mul(6n, 7n), 42n);
  });

  it("should divide two numbers correctly", async function () {
    const simpleMath = await deploy();
    assert.equal(await simpleMath.div(20n, 5n), 4n);
  });

  it("should revert when dividing by zero", async function () {
    const simpleMath = await deploy();
    await expect(simpleMath.div(1n, 0n)).to.be.revertedWith(
      "div: division by zero",
    );
  });
});
