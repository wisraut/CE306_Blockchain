# Script อธิบาย App.js (บรรทัด 1 ถึง return)

## 1. import (บรรทัด 1-9)

ไฟล์นี้เป็นหน้าเว็บ frontend ของ contract SimpleMath ด้านบนเป็นการ import ก่อน มีสี่ตัว

- ตัวแรกคือ React กับ hook สองตัว `useState` ใช้เก็บ state ของหน้าจอ ส่วน `useEffect` ใช้รันโค้ดตอนหน้าเว็บเปิดขึ้นมา
- ตัวที่สองคือ component ของ react-bootstrap พวกปุ่ม ตาราง ช่องกรอก และกล่องแสดงผล
- ตัวที่สามคือ `ethers` เป็น library ที่ใช้คุยกับ blockchain
- ตัวสุดท้ายคือ `SimpleMath.json` เป็น artifact ที่ได้หลัง compile contract ไฟล์นี้เราใช้แค่ส่วน ABI ไว้บอก ethers ว่า contract มี function อะไรบ้าง

## 2. ค่าคงที่ (บรรทัด 11-18)

ต่อมาเป็นค่าคงที่สามตัว

- `contractAddress` คือ address ที่ contract ถูก deploy ไว้บน Hardhat node ในเครื่อง ได้มาตอน deploy ด้วย ignition
- `WEB3_URL` คือ URL แบบ WebSocket ของ Hardhat node เอาไว้ใช้ตอนที่ browser ไม่มี MetaMask
- `INTEGER_PATTERN` เป็น regex เช็คว่าค่าที่กรอกเป็นจำนวนเต็ม ติดลบได้แต่ห้ามมีทศนิยม เพราะ contract รับค่าเป็น `int256`

## 3. state (บรรทัด 21-27)

เข้ามาใน component `App` จะเจอ state หกตัว

- `provider` คือตัวเชื่อมกับ blockchain
- `connected` บอกว่ากด Connect สำเร็จหรือยัง
- `firstOperand` กับ `secondOperand` คือค่าในช่องกรอกสองช่อง เก็บไว้เป็น string
- `contract` คือ contract instance ที่จะใช้เรียก add, sub, mul, div
- `result` คือข้อความในกล่องผลลัพธ์ ซึ่งเป็นได้ทั้งผลคำนวณและข้อความ error

## 4. useEffect สร้าง provider (บรรทัด 31-47)

ส่วน `useEffect` ใส่ dependency เป็น array ว่าง เลยรันแค่ครั้งเดียวตอนเปิดหน้าเว็บ

ข้างในเช็คก่อนว่ามี `window.ethereum` หรือเปล่า ถ้ามีแปลว่า browser มี wallet อย่าง MetaMask ก็จะใช้ `BrowserProvider` ถ้าไม่มีก็ต่อตรงไปที่ Hardhat node ผ่าน `WebSocketProvider` พอได้ provider แล้วก็เก็บลง state

ตรง `return` ข้างใน useEffect เป็น cleanup ที่จะรันตอน component ถูกถอดออก มันจะเรียก `destroy()` ปิด connection ทิ้ง ที่ต้องมีเพราะตอน dev React StrictMode จะ mount สองรอบ ถ้าไม่ปิดจะมี WebSocket ค้างไว้หนึ่งตัว

## 5. connectWallet (บรรทัด 50-72)

function `connectWallet` ผูกไว้กับปุ่ม Connect

- บรรทัดแรกกันไว้ก่อน ถ้า provider ยังไม่พร้อมก็แจ้งแล้วจบ
- จากนั้นเรียก `getSigner()` เพื่อเอา signer ซึ่งก็คือ account ที่จะใช้เรียก contract ถ้าใช้ MetaMask มันจะเด้งให้เลือก account ตรงนี้
- ต่อมาสร้าง `ethers.Contract` จากสามอย่าง คือ address, ABI และ signer ผลที่ได้เป็น object ที่เรียก function ของ contract ได้เหมือน function JavaScript ธรรมดา
- สุดท้ายตั้ง `connected` เป็น true และเก็บ contract ลง state
- ถ้าเกิด error เช่น user กด reject ใน MetaMask หรือ node ยังไม่ได้เปิด ก็จะไปที่ catch แล้วเอาข้อความ error ไปแสดง

## 6. handleCalculation (บรรทัด 76-129)

function `handleCalculation` ใช้ร่วมกันทั้งสี่ปุ่ม โดยรับ `operator` เข้ามา ซึ่งเป็นชื่อ function ใน contract

- เช็คชั้นแรกว่า connect แล้วหรือยัง ถ้ายังจะไม่มี contract ให้เรียก
- เช็คชั้นที่สอง เอาทั้งสองช่องไปเทียบกับ regex ถ้าช่องว่างหรือมีทศนิยมก็ไม่ผ่าน
- แปลงเป็น `BigInt` เพราะ `int256` ใหญ่เกินกว่าที่ Number ของ JS จะเก็บได้แม่น ถ้าเกิน 2 ยกกำลัง 53 ค่าจะเพี้ยน
- จากนั้นใช้ `switch` เลือกว่าจะเรียก function ไหนของ contract
- เฉพาะกรณี div จะเช็คหารด้วยศูนย์ที่หน้าเว็บก่อน จะได้ไม่ต้องยิงไปที่ node ซึ่งใน contract เองก็มี `require` กันไว้อีกชั้นหนึ่ง
- function พวกนี้เป็น pure ทั้งหมด เลยเป็นแค่การ call อ่านค่า ไม่ได้ส่ง transaction และไม่เสีย gas
- ค่าที่ได้กลับมาเป็น BigInt ก็แปลงเป็น string แล้วแสดงผล
- จะล้างช่องกรอกก็ต่อเมื่อคำนวณสำเร็จ ถ้า error ค่าที่กรอกยังอยู่ ผู้ใช้แก้ต่อได้เลย
- catch ไว้รับ error จาก node หรือ contract เช่น revert หรือที่ address นั้นไม่มี contract อยู่

## 7. ส่งต่อไปที่ return (บรรทัด 132)

ส่วนที่ผ่านมาเป็น logic ทั้งหมด ต่อจากนี้เป็น `return` ซึ่งเป็นส่วน UI ที่เอา state กับ function ข้างบนมาผูกเข้ากับปุ่มและช่องกรอก

## คำถามที่อาจโดนถาม

- ทำไมใช้ `BigInt` แทน `Number`: เพราะ int256 ใหญ่เกิน 2^53
- ทำไมไม่เสีย gas: เพราะเป็น pure function เลยเป็น call ไม่ใช่ transaction
- ทำไมเช็คหารศูนย์ซ้ำทั้งหน้าเว็บและใน contract: หน้าเว็บเช็คเพื่อไม่ต้องยิงไป node โดยไม่จำเป็น ส่วน contract เป็นด่านจริง คนที่เรียกตรงโดยไม่ผ่านหน้าเว็บก็ยังโดนกัน
- cleanup ใน useEffect มีไว้ทำไม: ปิด WebSocket ไม่ให้ค้างตอน StrictMode mount สองรอบ

ถ้าเวลาพูดจำกัด ข้อ 2 กับ 3 พูดสั้นได้ ส่วนข้อ 4 ถึง 6 เป็นแกนของเรื่อง ควรเก็บไว้

