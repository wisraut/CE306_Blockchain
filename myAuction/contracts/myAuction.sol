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
    enum AuctionState { Started, Ended, Cancelled }
    // client function
    // ยื่นประมูลต้องส่งเงินมาด้วย
    function bid() virtual external payable;
    //ดูยอดประมูลของผู้ประมูล
    function getMybid(address bider) virtual external view returns (uint256);

    //owner function
    // จบการประมูล
    function endAuction() virtual external;
    //ยกเลิกการประมูล
    function cancelAuction() virtual external;

    //shared function
    //ถอนเงิน
    function withdraw() virtual external;
    //ดูรายละเอียดสินค้า
    function getProductinfo() virtual external view returns(string memory, string memory);
    //ดูสถานะการประมูล
    function getAuctionState() virtual external view returns (AuctionState);

    // event
    //มีการประมูล
    event bidEvent(address bider, uint256 amount, uint256 timestamp);
    //จบการประมูล
    event endAuctionEvent(string message, uint256 timestamp);
    //ยกเลิกการประมูล
    event cancelAuctionEvent(string message, uint256 timestamp);
    //มีการถอนเงิน
    event withdrawEvent(address bider, uint256 amount, uint256 timestamp);
}

contract MyAuction is Auction {
    Product public product;
    AuctionState public STATE;
    uint256 public endTime;
    uint256 public highestBid;
    address public highestBidder;
    mapping(address => uint256) public bids; // ยอดประมูลของแต่ละคน (address >> uint256)
    address[] public biders; // รายชื่อผู้ประมูล

    modifier onlyOwner() { // จะใช้ไดเฉพาะ เจ้าของ contract เท่านั้น
        require(msg.sender == owner, "Only owner can call this function");  //ถ้า msg.sender ==  เป็น False จะเกิด Revert String 
        _;
      
    }

    modifier notOwner() { 
        require(msg.sender != owner, "Owner cannot call this function");   
        _;
      
    }

    modifier onGoingAuction() { 
        require(STATE == AuctionState.Started, "Auction is stopped");   
        _;
      
    }


    constructor(string memory _brand, string memory _serialNumber, uint256 _duration) {
        owner = payable(msg.sender); // msg.sender คือคนที่ทำ Transaction เรียกใช้ constructor
        product = Product(_brand, _serialNumber);
        STATE = AuctionState.Started;
        //endTime = block.timestamp + _duration * 1 minutes; // block.timestamp จะมีเวลาใกล้เคียงปัจจุบัน
        endTime = block.timestamp + _duration * 1 seconds; // block.timestamp จะมีเวลาใกล้เคียงปัจจุบัน
    }
    function bid() external payable override notOwner onGoingAuction {
        require(msg.value + bids[msg.sender] > highestBid, "Bid must be higher than current highest bid");
        require(msg.sender != highestBidder, "You are already the highest bidder");
        highestBidder = msg.sender;
        if (bids[msg.sender] == 0) {
          biders.push(msg.sender);
        }
        bids[msg.sender] += msg.value;
        highestBid = bids[msg.sender];
        emit bidEvent(msg.sender, bids[msg.sender], block.timestamp);
    }
    // ดูยอดเงินที่ประมูลของตัวเองและผู้อื่น
    function getMybid(address bider) external view override returns (uint256) {
        return bids[bider];
    }

    // จบการประมูล
    function endAuction() external override onlyOwner onGoingAuction {
        STATE = AuctionState.Ended;
        emit endAuctionEvent("Auction has ended", block.timestamp);
    }
    // ยกเลิกการประมูล
    function cancelAuction() external override onlyOwner onGoingAuction {
        STATE = AuctionState.Cancelled;
        emit cancelAuctionEvent("Auction has been cancelled", block.timestamp);
    }
    // ถอนเงิน
    function withdraw() external override {
        uint256 amount = 0;
        address payable withdrawer = payable(msg.sender);
        require(STATE != AuctionState.Started, "Auction is still ongoing");
        if(withdrawer == owner) { // Owner can withdraw the highest bid
            require(STATE == AuctionState.Ended, "Owner can only withdraw after auction ended");
            require(bids[highestBidder] > 0, "No funds to withdraw for highest bidder");
            amount = highestBid;
            bids[highestBidder] = 0; // Reset the highest bidder's bid
        } else { // Other bidders can withdraw their bids
            bool allowed = ((STATE == AuctionState.Ended && withdrawer != highestBidder) ||
                (STATE == AuctionState.Cancelled)) &&
                bids[withdrawer] > 0;
            require(allowed, "You are not allowed to withdraw");
            amount = bids[withdrawer];
            bids[withdrawer] = 0;
        }
        (bool sent, ) = payable(withdrawer).call{value: amount}("");
        require(sent, "Failed to send Ether");
        emit withdrawEvent(withdrawer, amount, block.timestamp);
    }
    // ดูรายละเอียดสินค้า
    function getProductinfo() external view override
    returns (string memory, string memory) {
        return (product.Brand, product.SerialNumber);
    }

    function getAuctionState() external view override returns (AuctionState) {
        return STATE;
    }
}