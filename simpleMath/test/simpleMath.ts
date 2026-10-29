import { assert, expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("simpleMath", function () {
  it("should add two numbers correctly", async function () {
    assert.equal(2 + 3, 5);}
  );

  it("should subtract two numbers correctly", async function () {
    assert.equal(10 - 4, 6);}
  );

  it("should multiply two numbers correctly", async function () {
    assert.equal(6 * 7, 42);}
  );

  it("should divide two numbers correctly", async function () {
    assert.equal(20 / 5, 4);}
  );


});
