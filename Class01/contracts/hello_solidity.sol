// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract HelloSolidity {
    uint public val1;     // uint = uint256 จองได้สูงสุด 32 Bytes (256 bits)  เวลาที่ไม่ระบุขนาดจะเป็น uint256 โดย Default
    uint private val2;

    // constructor(uint _val1, uint _val2) {
    //     val1 = _val1;
    //     val2 = _val2;
    // }

    function setVal1(uint _val1) public { // Public = Everyone can call   internal = เรียกใช้เฉพาะ Contract นั้น   External = ใครก็ได้ที่ไม่ใช่ Contract ตัวเอง(ภายนอกเท่านั้น)  ทั้งสามตัวนี้เรียกว่า Visibility ของ Function
        val1 = _val1;
    }

    function setVal2(uint _val2) public {
        val2 = _val2;
    }

    function getVal2() public view returns(uint) { // getter ดึงค่าตัวแปร Val2  View = อ่านค่าได้อย่างเดียว ไม่สามารถแก้ไขค่าได้
        return val2;
    }

    function addVal(uint _val1, uint _val2) public pure returns(uint) { // Pure = ไม่สามารถอ่านค่าและแก้ไขค่าได้  ใช้ในการประมวลผลใน Arguments ของ Function เท่านั้น ในที่นี้คือ _val1 และ _val2
        return _val1 + _val2;
    }
}
