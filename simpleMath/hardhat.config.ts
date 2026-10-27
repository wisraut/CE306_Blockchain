import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable, defineConfig } from "hardhat/config";

export default defineConfig({
  solidity: "0.8.34",
  plugins: [hardhatToolboxMochaEthersPlugin],
  networks: {
    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545",
    }
  }
});
