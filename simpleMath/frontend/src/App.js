import React, { useState, useEffect } from "react";
import { Button, Table, Form, Container, Card } from "react-bootstrap";
import { ethers } from "ethers";
import SimpleMathContract from "./SimpleMath.json";
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const WEB3_URL = "ws://127.0.0.1:8545";

function App() {
  const [provider, setProvider] = useState(null);
  const [connected, setConnected] = useState(false);
  const [firstOperand, setFirstOperand] = useState("");
  const [secondOperand, setSecondOperand] = useState("");
  const [contract, setContract] = useState(null);
  const [result, setResult] = useState("");

  useEffect(() => {
    const p = new ethers.WebSocketProvider(WEB3_URL);
    setProvider(p);
    return () => {
      p.destroy();
    };
  }, []);

  const connectWallet = async () => {
    try {
      const signerInstance = await provider.getSigner();
      console.log("Owner address", await signerInstance.getAddress());
      console.log("contract address", contractAddress);
      console.log("abi", SimpleMathContract.abi);
      const sm = new ethers.Contract(contractAddress, SimpleMathContract.abi, signerInstance);
      console.log("contract", sm);
      setConnected(true);
      setContract(sm);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCalculation = async operator => {
    if (!contract) {
      setResult("กด Connect ก่อน");
      return;
    }
    if (firstOperand === "" || secondOperand === "") {
      setResult("กรอกตัวเลขให้ครบทั้งสองช่อง");
      return;
    }
    try {
      const r = await contract[operator](firstOperand, secondOperand);
      setResult(r.toString());
    } catch (e) {
      console.error(e);
      setResult(e.shortMessage || e.message);
    }
  };

  return (
    <Container fluid style={{ width: "80%", marginTop: "20px" }}>
      <Button
        className="m-3"
        onClick={connectWallet}
        disabled={!provider || connected}
      >
        {connected ? "Connected" : "Connect"}
      </Button>

      <Table striped bordered hover>
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

      {/* Result Card */}
      <Card className="mt-4">
        <Card.Body>
          <Card.Title>Calculation Result: {result}</Card.Title>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default App;