import { expect } from "chai";
import { network } from "hardhat";
//const Product = require("../ignition/modules/product.json");
const Product =
{
    "Brand": "LnwZa:", // ชื่อแบรนด์สินค้า
    "SerialNumber": "SN123456", // หมายเลขซีเรียลของสินค้า
    "Duration": 5 // ระยะเวลาในการประมูล
};
const { ethers } = await network.create();

describe("MyAuction", function () {
  let MyAuction: any; // ประกาศตัวแปรเก็บ ContractFactory (พิมพ์แบบจำลองสัญญา)
  let myAuction: any; // ประกาศตัวแปรเก็บ Contract Instance ที่ดึงไปใช้งานจริงหลัง Deploy
  let owner: any; // ประกาศตัวแปรเก็บ Account ผู้สร้าง/เจ้าของสัญญา
  let bidders: any; // ประกาศตัวแปรเก็บ Array ของ Account ผู้ลงเข้าร่วมเสนอราคา (Bidders)
  let sampleBidAmount: any = [1, 1.2, 1.5, 2]; // กำหนดตัวเลขมูลค่าเสนอราคาจำลองในหน่วย Ether
  
  // แปลงค่าเงินจากหน่วย Ether ใน Array ข้างบนให้กลายเป็นหน่วย Wei (BigInt) ด้วย ethers.parseEther
  let sampleBidAmountInWei: any = sampleBidAmount.map((amount: number) =>
    ethers.parseEther(amount.toString()));

  beforeEach(async function () {
    console.log("Deploying MyAuction contract..."); // แสดงข้อความแจ้งเตือนสถานะการเริ่ม Deploy ใน Console
    //MyAuction = await ethers.getContractFactory("MyAuction");
    
    // สร้างและสั่ง Deploy สัญญา MyAuction ขึ้นบล็อกเชนจำลอง พร้อมส่งพารามิเตอร์ 3 ตัวเข้าไปใน constructor
    myAuction = await MyAuction.deploy(Product.Brand, Product.SerialNumber, Product.Duration);
    
    // ดึงรายการบัญชีผู้ใช้ (Signers) จาก Hardhat node โดยแยกตัวแรกเป็น owner และที่เหลือกระจายลงในอาร์เรย์ bidders
    [owner, ...bidders] = await ethers.getSigners();
  });

  // ตรวจสอบว่าสัญญาคืนค่าข้อมูลสินค้าถูกต้องหรือไม่
  it("Should return product information", async function () {
    // เรียกฟังก์ชัน getProductInfo() จาก Smart Contract เพื่อรับค่า brand และ serialNumber
    const [brand, serialNumber] = await myAuction.getProductInfo();
    
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
      
      // ดึงยอดประมูลของผู้ใช้คนที่ i จากฟังก์ชัน getBid
      const bidAmount = await myAuction.getBid(bidders[i].address);
      
      // เช็คว่ายอดที่ผู้ใช้ใส่ลงไป ตรงกับยอดที่บันทึกในสัญญาหรือไม่
      expect(bidAmount).to.equal(sampleBidAmountInWei[i]);
      
      // เช็คว่ายอดประมูลสูงสุดของสัญญา อัปเดตตรงกับยอดล่าสุดที่ส่งไปหรือไม่
      expect(highestBid).to.equal(sampleBidAmountInWei[i]);
    }
  });
  
  // ทดสอบการปิดการประมูล
  it("end the auction", async function () {
    expect(false).to.be.true; // สั่งให้ Test ข้อนี้ FAIL เสมอ
  });
  
  // ทดสอบการยกเลิกการประมูล
  it("should cacle the auction", async function () {
    expect(false).to.be.true; // สั่งให้ Test ข้อนี้ FAIL เสมอ (Placeholder)
  });
  
  // ทดสอบการถอนเงินประมูลคืน/ถอนรายได้
  it("should make a withdraw", async function () {
    expect(false).to.be.true; // สั่งให้ Test ข้อนี้ FAIL เสมอ (Placeholder)
  });
});