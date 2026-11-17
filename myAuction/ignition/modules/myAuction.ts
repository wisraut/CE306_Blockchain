import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const Product =
{
    "Brand": "olo:",
    "SerialNumber": "SN123456",
    "Duration": 5
};

export default buildModule("CounterModule", (m) => {
  const brand = m.getParameter("brand", Product.Brand);
  const serialNumber = m.getParameter("serialNumber", Product.SerialNumber);
  const duration = m.getParameter("duration", Product.Duration);

  const myAuction = m.contract("MyAuction", [brand, serialNumber, duration]);

  return { myAuction };
});
