import React, { useState, useEffect } from "react";
import { Button, Table, Form, Container, Card } from "react-bootstrap";
import { ethers } from "ethers";
import SimpleMathContract from "./SimpleMath.json";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const WEB3_URL = "ws://127.0.0.1:8545";
const INTEGER_PATTERN = /^-?\d+$/;

function App() {
  const [provider, setProvider] = useState(null); // ตัวเชื่อมต่อ blockchain (MetaMask หรือ WebSocket)
  const [connected, setConnected] = useState(false); // กด Connect สำเร็จแล้วหรือยัง
  const [firstOperand, setFirstOperand] = useState(""); // ค่าในช่องกรอกตัวที่ 1 (เก็บเป็น string)
  const [secondOperand, setSecondOperand] = useState(""); // ค่าในช่องกรอกตัวที่ 2 (เก็บเป็น string)
  const [contract, setContract] = useState(null); // contract instance ที่ใช้เรียก add/sub/mul/div
  const [result, setResult] = useState(""); // ข้อความที่แสดงในกล่องผลลัพธ์ (ผลคำนวณ หรือข้อความ error)

  useEffect(() => { 
    let providerInstance;
    if (window.ethereum) { // เช็คว่าเบราว์เซอร์มี wallet ฝังอยู่ไหม
      providerInstance = new ethers.BrowserProvider(window.ethereum); // สร้าง provider ที่คุยผ่าน MetaMask
    } else { // กรณีไม่มี wallet
      providerInstance = new ethers.WebSocketProvider(WEB3_URL); // สร้าง provider ที่ต่อ WebSocket ไปที่ node
    }
    setProvider(providerInstance); // เก็บ provider ลง state ให้ function อื่นใช้ต่อ
    console.log("Provider set:", providerInstance); 
    return () => { 
      providerInstance.destroy(); // ปิด connection ของ provider ตัวนี้
    };
  }, []); 

  // ===== ปุ่ม Connect: ขอ signer แล้วสร้าง contract instance =====
  const connectWallet = async () => { 
    if (!provider) { // ยังไม่มี provider กันกดก่อน useEffect สร้าง provider เสร็จ
      setResult("Provider is not ready yet.")
      return; 
    }
    try { 
      const signerInstance = await provider.getSigner(); // ขอ account มาเป็น signer
      console.log("Owner address", await signerInstance.getAddress()); // log address ของ account ที่ได้
      console.log("contract address", contractAddress); // log address ของ contract ที่จะเรียก
      console.log("abi", SimpleMathContract.abi);
      const sm = new ethers.Contract(contractAddress, SimpleMathContract.abi, signerInstance); // สร้าง contract instance
      console.log("contract", sm); 
      setConnected(true); // ตั้งสถานะว่า connect แล้ว (ปุ่มเปลี่ยนเป็น Connected)
      setContract(sm); // เก็บ contract instance ลง state ให้ handleCalculation ใช้
    } catch (e) { // ถ้าขั้นไหนใน try พัง จะมาที่นี่
      console.error(e); // log error เต็มๆ ไว้ debug
      setResult(e.shortMessage || e.message); // แสดงข้อความ error (ใช้ shortMessage ของ ethers ก่อน ถ้าไม่มีใช้ message)
    }
  };

  const handleCalculation = async operator => {
    if (!connected || !contract) { // ยังไม่ connect หรือยังไม่มี contract
      setResult("Please connect your wallet first.");
      return; 
    }
    // เช็คว่ากรอกครบและเป็นจำนวนเต็มทั้งสองช่อง
    if (!INTEGER_PATTERN.test(firstOperand) || !INTEGER_PATTERN.test(secondOperand)) { // ช่องไหนไม่ใช่จำนวนเต็ม
      setResult("Please enter valid integers.");
      return; 
    }

    // แปลงเป็น BigInt เพราะ int256 ใหญ่กว่าที่ Number ของ JS เก็บได้แม่น (เกิน 2^53 จะเพี้ยน)
    const num1 = BigInt(firstOperand); // ตัวตั้ง
    const num2 = BigInt(secondOperand); // ตัวกระทำ

    try { 
      let res; // ตัวแปรเก็บผลที่ contract คืนมา
      switch (operator) { 
        case "add": 
          res = await contract.add(num1, num2); // เรียก add บน contract แล้วรอผล
          break; 
        case "sub": 
          res = await contract.sub(num1, num2); // เรียก sub บน contract แล้วรอผล
          break; 
        case "mul": 
          res = await contract.mul(num1, num2); // เรียก mul บน contract แล้วรอผล
          break; 
        case "div":
          if (num2 === 0n) { // 0n คือเลข 0 แบบ BigInt
            setResult("Cannot divide by zero."); // แจ้งว่าหาร 0 ไม่ได้
            return; 
          }
          res = await contract.div(num1, num2);
          break; // ออกจาก switch
        default: 
          setResult("Invalid operator."); 
          return; 
      }
      setResult(res.toString()); // แสดงผลลัพธ์ในกล่อง
      setFirstOperand(""); 
      setSecondOperand(""); 
    } catch (e) { // ถ้าเรียก contract แล้วพัง จะมาที่นี่
      // error จาก node/contract เช่น revert หรือ contract ไม่มีอยู่ที่ address นี้
      console.error(e); // log error เต็มๆ ไว้ debug
      setResult(e.shortMessage || e.message); // แสดงข้อความ error ในกล่องผลลัพธ์
    }
  };

  // ===== UI =====
  return (
    <Container fluid style={{ width: "80%", marginTop: "20px" }}>
      {/* ปุ่ม Connect: สีเทาตอนยังไม่ต่อ, สีน้ำเงินตอนต่อแล้ว */}
      <Button
        variant={connected ? "primary" : "secondary"}
        className="m-3"
        onClick={connectWallet}
      >
        {connected ? "Connected" : "Connect"}
      </Button>

      <Table striped bordered hover>
        {/* หัวตาราง */}
        <thead>
          <tr>
            <th className="text-center">#</th>
            <th className="text-center" colSpan={"2"}>
              First Operand
            </th>
            <th className="text-center" colSpan={"2"}>
              Second Operand
            </th>
          </tr>
        </thead>
        <tbody>
          {/* แถวช่องกรอกตัวเลข 2 ช่อง: พิมพ์แล้วอัปเดต state ทันที (controlled input) */}
          <tr>
            <td className="text-center">Input</td>
            <td colSpan={"2"}>
              <Form.Control
                type="number"
                name="firstOperand"
                value={firstOperand}
                onChange={e => setFirstOperand(e.target.value)}
              />
            </td>
            <td colSpan={"2"}>
              <Form.Control
                type="number"
                name="secondOperand"
                value={secondOperand}
                onChange={e => setSecondOperand(e.target.value)}
              />
            </td>
          </tr>
          {/* แถวปุ่มเครื่องหมาย: แต่ละปุ่มส่งชื่อ function ของ contract เข้า handleCalculation */}
          <tr>
            <td className="text-center">Operator</td>
            <td>
              <Button
                variant="success"
                className="w-100"
                onClick={() => handleCalculation("add")}
              >
                Add
              </Button>
            </td>
            <td>
              <Button
                variant="danger"
                className="w-100"
                onClick={() => handleCalculation("sub")}
              >
                Subtract
              </Button>
            </td>
            <td>
              <Button
                variant="warning"
                className="w-100"
                onClick={() => handleCalculation("mul")}
              >
                Multiply
              </Button>
            </td>
            <td>
              <Button
                variant="info"
                className="w-100"
                onClick={() => handleCalculation("div")}
              >
                Divide
              </Button>
            </td>
          </tr>
        </tbody>
      </Table>

      {/* กล่องแสดงผลลัพธ์: แสดงค่าใน state result (ผลคำนวณ หรือข้อความ error) */}
      <Card className="mt-4">
        <Card.Body>
          <Card.Title>Calculation Result: {result}</Card.Title>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default App;
