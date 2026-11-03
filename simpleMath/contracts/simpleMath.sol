// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.34;

contract Counter {
  uint public x;

  event Increment(uint by);

  function inc() public {
    x++;
    emit Increment(1);
  }

  function incBy(uint by) public {
    require(by > 0, "incBy: increment should be positive");
    x += by;
    emit Increment(by);
  }
}

contract SimpleMath {
  function add(int a, int b) public pure returns (int) {
    return a + b;
  }

  function sub(int a, int b) public pure returns (int) {
    return a - b;
  }

  function mul(int a, int b) public pure returns (int) {
    return a * b;
  }

  function div(int a, int b) public pure returns (int) {
    require(b != 0, "div: division by zero");
    return a / b;
  }
}
