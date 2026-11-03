import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SimpleMathModule", (m) => {
  const simpleMath = m.contract("SimpleMath");

  return { simpleMath };
});
