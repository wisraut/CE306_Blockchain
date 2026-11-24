import { expect } from "chai";
import { network } from "hardhat";
//const Product = require("../ignition/modules/product.json");
const Product =
{
    "Brand": "Iphone 99 Pro Max", // ชื่อแบรนด์สินค้า
    "SerialNumber": "IP99PM2024", // หมายเลขซีเรียลของสินค้า
    "Duration": 2 // ระยะเวลาในการประมูล
};
const { ethers } = await network.create();

describe("MyAuction", function () {
  let myAuction: any; // ประกาศตัวแปรเก็บ Contract Instance ที่ดึงไปใช้งานจริงหลัง Deploy
  let owner: any; // ประกาศตัวแปรเก็บ Account ผู้สร้าง/เจ้าของสัญญา
  let bidders: any; // ประกาศตัวแปรเก็บ Array ของ Account ผู้ลงเข้าร่วมเสนอราคา (Bidders)
  let sampleBidAmount: any = [1, 1.2, 1.5, 2, 2.5, 3]; // กำหนดตัวเลขมูลค่าเสนอราคาจำลองในหน่วย Ether
  
  // แปลงค่าเงินจากหน่วย Ether ใน Array ข้างบนให้กลายเป็นหน่วย Wei (BigInt) ด้วย ethers.parseEther
  let sampleBidAmountInWei: any = sampleBidAmount.map((amount: number) =>
    ethers.parseEther(amount.toString()));

  beforeEach(async function () {
    console.log("Deploying MyAuction contract..."); // แสดงข้อความแจ้งเตือนสถานะการเริ่ม Deploy ใน Console
    // สร้างและสั่ง Deploy สัญญา MyAuction ขึ้นบล็อกเชนจำลอง พร้อมส่งพารามิเตอร์ 3 ตัวเข้าไปใน constructor
    myAuction = await ethers.deployContract("MyAuction", [Product.Brand, Product.SerialNumber, Product.Duration]);
    
    // ดึงรายการบัญชีผู้ใช้ (Signers) จาก Hardhat node โดยแยกตัวแรกเป็น owner และที่เหลือกระจายลงในอาร์เรย์ bidders
    [owner, ...bidders] = await ethers.getSigners();
  });

  // ตรวจสอบว่าสัญญาคืนค่าข้อมูลสินค้าถูกต้องหรือไม่
  it("Should return product information", async function () {
    // เรียกฟังก์ชัน getProductinfo() จาก Smart Contract เพื่อรับค่า brand และ serialNumber
    const [brand, serialNumber] = await myAuction.getProductinfo();
    
    // ตรวจสอบว่า brand ที่ได้ตรงกับข้อมูลตั้งต้นใน Product.Brand
    expect(brand).to.equal(Product.Brand);
    
    // ตรวจสอบว่า serialNumber ที่ได้ตรงกับข้อมูลตั้งต้นใน Product.SerialNumber
    expect(serialNumber).to.equal(Product.SerialNumber);
  });

  // ตรวจสอบว่าผู้เสนอราคาสามารถส่งบิดเข้ามาได้ถูกต้องหรือไม่
  it("Should allow bidders to place bids", async function () { 
    // วนลูปตามจำนวนยอดเงินประมูลจำลองที่มีในอาร์เรย์ sampleBidAmountInWei
    for (let i=0; i < sampleBidAmountInWei.length; i++) {
      // เชื่อมต่อสัญญากับ Account ผู้เสนอราคาคนที่ i
      const ct = await myAuction.connect(bidders[i]);
      
      // เรียกฟังก์ชัน bid() พร้อมส่งจำนวนเงินประมูลประจำรอบนั้นไปด้วย
      const tx = await ct.bid({ value: sampleBidAmountInWei[i] });
      
      // รอให้ Transaction ถอนลงบล็อกเชนสำเร็จและรับใบเสร็จ
      const receipt = await tx.wait();
      
      // ตรวจสอบว่าสถานะ Transaction สำเร็จหรือไม่
      expect(receipt.status).to.equal(1);
      
      // ดึงค่ายอดประมูลที่สูงที่สุด
      const highestBid = await myAuction.highestBid();
      
      // ดึงยอดประมูลของผู้ใช้คนที่ i จากฟังก์ชัน getMybid
      const bidAmount = await myAuction.getMybid(bidders[i].address);
      
      // เช็คว่ายอดที่ผู้ใช้ใส่ลงไป ตรงกับยอดที่บันทึกในสัญญาหรือไม่
      expect(bidAmount).to.equal(sampleBidAmountInWei[i]);
      
      // เช็คว่ายอดประมูลสูงสุดของสัญญา อัปเดตตรงกับยอดล่าสุดที่ส่งไปหรือไม่
      expect(highestBid).to.equal(sampleBidAmountInWei[i]);
    }
  });
  
  const AUCTION_STATE = {"Started": 0, "Ended": 1, "Cancelled": 2};
  const delay = (s: number) => new Promise((resolve) => setTimeout(resolve, s * 1000)); // หน่วงเวลาเป็นวินาที
  // ทดสอบการปิดการประมูล
  it("end the auction", async function () {
    const ct = myAuction.connect(owner); // connect owner's wallet to the contract
    await delay(Product.Duration + 3); // รอให้เวลาผ่านไปตามระยะเวลาที่กำหนดใน Product.Duration
    const tx = await ct.endAuction();
    const receipt = await tx.wait();
    expect(receipt.status).to.equal(1);
    const auctionState = await ct.STATE();
    expect(auctionState).to.equal(AUCTION_STATE.Ended);
  });
  
  // ทดสอบการยกเลิกการประมูล
  it("should cancel the auction", async function () {
    const ct = myAuction.connect(owner); // connect owner's wallet to the contract
    const tx = await ct.cancelAuction();
    const receipt = await tx.wait();
    expect(receipt.status).to.equal(1);
    const auctionState = await ct.STATE();
    expect(auctionState).to.equal(AUCTION_STATE.Cancelled);
  });
  
  // ทดสอบการถอนเงินประมูลคืน/ถอนรายได้ หลังจบการประมูล
  it("should make a withdrawal after auction ends", async function () {
    let ct, tx, receipt;
    for (let i = 0; i < sampleBidAmountInWei.length; i++) {
      ct = await myAuction.connect(bidders[i]); // connect bidder's wallet to the contract
      tx = await ct.bid({ value: sampleBidAmountInWei[i] });
      receipt = await tx.wait();
    }
    await delay(Product.Duration + 3); // Wait for the auction duration to end
    ct = myAuction.connect(owner); // connect owner's wallet to the contract
    tx = await ct.endAuction();
    receipt = await tx.wait();
    let i;
    for (i = 0; i < sampleBidAmountInWei.length - 1; i++) {
      ct = await myAuction.connect(bidders[i]); // connect bidder's wallet to the contract
      await expect(ct.withdraw()).to.changeEtherBalance(ethers, bidders[i], sampleBidAmountInWei[i]);
    }
    ct = myAuction.connect(owner); // connect owner's wallet to the contract
    await expect(ct.withdraw()).to.changeEtherBalance(ethers, owner,
      sampleBidAmountInWei[sampleBidAmountInWei.length - 1]);
  });

  // ทดสอบการถอนเงินประมูลคืน หลังยกเลิกการประมูล
  it("should make a withdrawal after auction is cancelled", async function () {
    let ct, tx, receipt;
    for (let i = 0; i < sampleBidAmountInWei.length; i++) {
      ct = myAuction.connect(bidders[i]); // connect bidder's wallet to the contract
      tx = await ct.bid({ value: sampleBidAmountInWei[i] });
      receipt = await tx.wait();
    }
    ct = myAuction.connect(owner); // connect owner's wallet to the contract
    tx = await ct.cancelAuction();
    receipt = await tx.wait();
    let i;
    for (i = 0; i < sampleBidAmountInWei.length; i++) {
      ct = myAuction.connect(bidders[i]); // connect bidder's wallet to the contract
      await expect(ct.withdraw()).to.changeEtherBalance(ethers, bidders[i], sampleBidAmountInWei[i]);
    }
    ct = await myAuction.connect(owner); // connect owner's wallet to the contract
    await expect(ct.withdraw()).to.be.revertedWith("Owner can only withdraw after auction ended"); // Owner should not be able to withdraw any funds after cancellation
  });
});
