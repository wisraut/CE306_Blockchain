import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("simpleMathModule", (m) => {
  const simpleMath = m.contract("");
  return { simpleMath };
});
