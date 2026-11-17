// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.34 < 0.9.0;
abstract contract Auction {
    // เจ้าของ
    address payable public owner;
    // รายละเอียดสินค้า
    struct Product {
        string Brand;
        string SerialNumber;
    }
    // สถานะการประมูล
    enum AuctionState { Started, Ended, Canceled }
    // client function
    // ยื่นประมูลต้องส่งเงินมาด้วย
    function bid() virtual external payable;
    //ดูยอดประมูลของผู้ประมูล
    function getMyBid(address bidder) virtual external view returns (uint256);

    //owner function
    // จบการประมูล
    function endAuction() virtual external;
    //ยกเลิกการประมูล
    function cancelAuction() virtual external;

    //shared function
    //ถอนเงิน
    function withdraw() virtual external;
    //ดูรายละเอียดสินค้า
    function getProduct() virtual external view returns(string memory, string memory);

    // event
    //มีการประมูล
    event BidEvent(address bidder, uint256 amount, uint256 timestamp);
    //จบการประมูล
    event EndedEvent(string message, uint256 timestamp);
    //ยกเลิกการประมูล
    event CanceledEvent(string message, uint256 timestamp);
    //มีการถอนเงิน
    event WithdrawEvent(address withdrawer, uint256 amount, uint256 timestamp);
}

contract MyAuction is Auction {
    Product public product;
    AuctionState public STATE;
    uint256 public endTime;
    uint256 public highestBid;
    address public highestBidder;

    modifier onlyOwner() { // จะใช้ไดเฉพาะ เจ้าของ contract เท่านั้น
        require(msg.sender == owner, "Only owner can call this function");  //ถ้า msg.sender ==  เป็น False จะเกิด Revert String 
        _;
      
    }

    modifier notOwner() { 
        require(msg.sender != owner, "Owner cannot call this function");   
        _;
      
    }

    modifier onGoingAuction() { 
        require(STATE == AuctionState.Started, "Auction is not ongoing");   
        _;
      
    }


    constructor(string memory _brand, string memory _serialNumber, uint256 _duration) {
        owner = payable(msg.sender); // msg.sender คือคนที่ทำ Transaction เรียกใช้ constructor
        product = Product(_brand, _serialNumber);
        STATE = AuctionState.Started;
        endTime = block.timestamp + _duration * 1 minutes; // block.timestamp จะมีเวลาใกล้เคียงปัจจุบัน
    }
    function bid() external payable override notOwner onGoingAuction {
        require(msg.value > highestBid, "Bid amount must be higher than the current highest bid");
        require(msg.sender != highestBidder, "You are already the highest bidder");
        highestBidder = msg.sender;
        if (bids[highestBidder] > 0) {
          biders.push(msg.sender);
        }
        bids[msg.sender] += msg.value;
        highestBid = bids[msg.sender];
    }

    function getMyBid(address bidder) external view override returns (uint256) {
        return bids[bidder];
    }

    function endAuction() external override {

    }

    function cancelAuction() external override {

    }

    function withdraw() external override {

    }

    function getProduct() external view override 
    returns (string memory, string memory) {
        return (product.Brand, product.SerialNumber);
    }
}