import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { ErrorDecoder } from "ethers-decode-error";
import AuctionContract from "./artifacts/contracts/myAuction.sol/MyAuction.json";
import { Button, Card, Container } from "react-bootstrap";
import BiddingForm from "./components/BiddingForm.jsx";
import EventHistory from "./components/EventHistory.jsx";
import WithdrawForm from "./components/WithdrawForm.jsx";
import BidHistory from "./components/BidHistory.jsx";
import AccountList from "./components/AccountList.jsx";
import AuctionInfo from "./components/AuctionInfo.jsx";
import MessageBox from "./components/MessageBox.jsx";

const WEB3_URL = "ws://127.0.0.1:8545";
const BID_EVENT = "bidEvent";
const WITHDRAWN_EVENT = "withdrawEvent";
const CANCELLED_EVENT = "cancelAuctionEvent";
// const DESTRUCTED_EVENT = "DestructedEvent";
const ENDED_EVENT = "endAuctionEvent";
// const ALL_EVENTS = [BID_EVENT, WITHDRAWN_EVENT, CANCELLED_EVENT, ENDED_EVENT, DESTRUCTED_EVENT];

const MyAuction = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [connected, setConnected] = useState(false);
  const [auctionInfo, setAuctionInfo] = useState({});
  const [bidValue, setBidValue] = useState("");
  const [currentBid, setCurrentBid] = useState("0");
  const [highestBid, setHighestBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState("N/A");
  const [message, setMessage] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [bidHistory, setBidHistory] = useState([]);
  const [withdrawValue, setWithdrawValue] = useState("");
  const [events, setEvents] = useState([]);
  const [lock, setLock] = useState(false);
  const [selectedId, setSelectedId] = useState(-1);
  const [errorDecoder, setErrorDecoder] = useState(null);
  const [auctionState, setAuctionState] = useState("");
  const [contractBalance, setContractBalance] = useState("");


  const AUCTION_STATE = ["STARTED", "ENDED", "CANCELLED", "DESTRUCTED"];
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with deployed contract address

  useEffect(() => {
    let providerInstance;
    if (window.ethereum) {
      // console.log('ethers', ethers)
      // const providerInstance = new ethers.providers.Web3Provider(window.ethereum);
      providerInstance = new ethers.BrowserProvider(window.ethereum);
      // alert ("Using metamask wallet");
    } else {
      // alert('Please install MetaMask!');
      // providerInstance = new ethers.JsonRpcProvider(WEB3_URL);
      providerInstance = new ethers.WebSocketProvider(WEB3_URL);
      // alert ("Using local hardhat node");
    }
    setProvider(providerInstance);
  }, []);

  const connectWallet = async () => {
    if (connected) return;
    try {
      // console.log('provider', provider);
      // await provider.send("eth_requestAccounts", []);
      const signerInstance = await provider.getSigner();
      // console.log(signerInstance);
      setSigner(signerInstance);
      console.log("Owner address", await signerInstance.getAddress());
      const auctionContract = new ethers.Contract(
        contractAddress,
        AuctionContract.abi,
        signerInstance
      );
      setErrorDecoder(ErrorDecoder.create([AuctionContract.abi]));
      // console.log('contract', auctionContract);
      setContract(auctionContract);
      await getAuctionInfo(auctionContract);
      // const state = await auctionContract.STATE();
      // setAuctionState(AUCTION_STATE[state]);

      console.log(provider.websocket.url);
      const newHighestBid = await auctionContract.highestBid();
      if (newHighestBid > 0) {
        setHighestBid(formatBalance(newHighestBid));
        const newHighestBidder = await auctionContract.highestBidder();
        setHighestBidder(newHighestBidder);
      }
      if (isLocalProvider(provider)) {
        await updateAllAccounts();
      }
      const _balance = formatBalance(await provider.getBalance(contractAddress));
      setContractBalance(_balance);
      console.log("Contract Balance:", _balance);
      // await updateState();
      auctionContract.on(BID_EVENT, handleBidEvent);
      auctionContract.on(WITHDRAWN_EVENT, handleWithdrawnEvent);
      auctionContract.on(CANCELLED_EVENT, handleCancelledAuctionEvent);
      auctionContract.on(ENDED_EVENT, handleEndedAuctionEvent);
      // auctionContract.on(DESTRUCTED_EVENT, handleEvent);
    } catch (err) {
      await handleContractError(err);
    }
    setConnected(true);
  };

  const handleContractError = async (error) => {
    try {
      const decodedError = await errorDecoder.decode(error);
      // const { name, args } = decodedError;
      const { name, reason } = decodedError;
      // console.log(decodedError)
      // const _name = "name" in decodedError;
      // const _args = "args" in decodedError;
      // if (typeof _name !== "undefined" && _name !== "")
      // console.log("name", _name);
      // if (typeof _args != "undefined" && typeof _args[0] != "undefined") {
      //   console.log("Error:", _args[0]);
      setMessage(name + ": " + reason);
    } catch (error) {
      console.log("HandleContractError", error);
    }
  };

  const isLocalProvider = (provider) =>
    provider.websocket &&
    provider.websocket.url &&
    provider.websocket.url.startsWith(WEB3_URL);

  const updateAllAccounts = async () => {
    // Fetch all accounts from the Hardhat network
    const _accounts = await provider.send("eth_accounts", []);
    // Iterate through each account and get the balance
    const accountWithBalances = await Promise.all(
      _accounts.map(async (account) => ({
        account,
        balance: await provider.getBalance(account),
      }))
    );
    setAccounts(accountWithBalances);
  };

  const getAuctionInfo = async (auctionContract) => {
    // const getAuctionInfo = async () => {
    try {
      const info = await auctionContract.getProductinfo();
      setAuctionInfo({ brand: info[0], serialNumber: info[1] });
      console.log(info);
      const state = await auctionContract.STATE();
      setAuctionState(AUCTION_STATE[state]);
    } catch (err) {
      console.error("Failed to fetch auction info: ", err);
      await handleContractError(err);
    }
  };

  const handleBidEvent = async (_bidder, _bidAmount, _timestamp, ...args) => {
    const eventInfo = {
      name: BID_EVENT,
      address: _bidder,
      amount: _bidAmount,
      timestamp: getTimestampStr(_timestamp),
    };
    console.log(eventInfo);
    setSelectedId(-1); // clear selected account id
    setCurrentBid(ethers.formatEther(_bidAmount));
    setHighestBid(ethers.formatEther(_bidAmount));
    setHighestBidder(_bidder);
    await updateAllAccounts();
    const _balance = formatBalance(await provider.getBalance(contractAddress));
    setContractBalance(_balance);
    setBidHistory((prevHistory) => [
      { bidder: _bidder, amount: _bidAmount },
      ...prevHistory,
    ]);
    setEvents((prevEvents) => [eventInfo, ...prevEvents]);
  };

  const getTimestampStr = timestamp => new Date(ethers.toNumber(timestamp) * 1000).toLocaleString();
  const handleCancelledAuctionEvent = async (_message, _timestamp, ...args) => {
    const eventInfo = {
      name: CANCELLED_EVENT,
      message: _message,
      timestamp: getTimestampStr(_timestamp),
    };
    console.log(eventInfo);
    try {
      setAuctionState("CANCELLED");
      setMessage("Auction is cancelled!");
      setEvents((prevEvents) => [eventInfo, ...prevEvents]);
    } catch (error) {
      console.log("handleCancelledAuction Error:", error);
    }
  };

  const handleEndedAuctionEvent = async (_message, _timestamp, ...args) => {
    const eventInfo = {
      name: ENDED_EVENT,
      message: _message,
      timestamp: getTimestampStr(_timestamp),
    };
    console.log(eventInfo);
    try {
      setAuctionState("ENDED");
      setMessage("Auction is ended!");
      setEvents((prevEvents) => [eventInfo, ...prevEvents]);
    } catch (error) {
      console.log("handleEndedAuction Error:", error);
    }
  };

  const handleWithdrawnEvent = async (
    _withdrawer,
    _amount,
    _timestamp,
    ...args
  ) => {
    const eventInfo = {
      name: WITHDRAWN_EVENT,
      address: _withdrawer,
      amount: _amount,
      timestamp: getTimestampStr(_timestamp),
    };
    console.log(eventInfo);
    setSelectedId(-1); // clear selected account id
    await updateAllAccounts();
    const _balance = formatBalance(await provider.getBalance(contractAddress));
    setContractBalance(_balance);
    setMessage("Withdrawal successful!");
    setEvents((prevEvents) => [eventInfo, ...prevEvents]);
  };

  const placeBid = async () => {
    // if (!signer) {
    console.log("begin bid");
    if (lock) {
    } else if (selectedId < 0) {
      setMessage("Please select Account !");
      return;
    } else if (!contract) {
      setMessage("Please connect wallet");
      return;
    } else if (!bidValue) {
      setMessage("Please enter your bid amount");
      return;
    }
    setLock(true);
    setMessage("");
    let _myBid;
    console.log("before  try");
    try {
      const _contract = await contract.connect(signer);
      // setContract(_contract);
      const _bidderAddr = await signer.getAddress();
      _myBid = await _contract.getMybid(_bidderAddr);
      let _bidValue = ethers.parseEther(bidValue) - _myBid;
      console.log(bidValue);
      console.log(_bidValue);
      console.log(_myBid);
      if (_bidValue <= 0) {
        setBidValue(ethers.formatEther(_myBid));
        setLock(false);
        return;
      }
      const tx = await _contract.bid({ value: _bidValue });
      await tx.wait();
      setLock(false);
    } catch (err) {
      setLock(false);
      setBidValue(ethers.formatEther(_myBid));
      await handleContractError(err);
      // setMessage(
      //   "Failed to place bid. Make sure you bid a higher value than the current highest bid."
      // );
      // console.error(err);
    }
  };

  const cancelAuction = async () => {
    if (!signer) {
      setMessage("Please select account");
      return;
    }
    try {
      const _contract = await contract.connect(signer);
      // setContract(_contract);
      const tx = await _contract.cancelAuction();
      await tx.wait();
    } catch (error) {
      console.log(error);
      await handleContractError(error);
    }
  };

  const endAuction = async () => {
    if (!signer) {
      setMessage("Please select account");
      return;
    }
    try {
      const _contract = await contract.connect(signer);
      // setContract(_contract);
      const tx = await _contract.endAuction();
      await tx.wait();
    } catch (error) {
      console.log(error);
      await handleContractError(error);
    }
  };

  const withdrawFunds = async () => {
    console.log("withdrawing");
    if (!signer) {
      setMessage("Please connect wallet first!");
      return;
    }
    try {
      const _contract = await contract.connect(signer);
      const tx = await _contract.withdraw();
      await tx.wait();
    } catch (err) {
      // console.error("Failed to withdraw: ", err);
      handleContractError(err);
      setMessage("Failed to withdraw funds. Please check the auction status.");
    }
  };

  const handleAccountSelect = async (idx) => {
    try {
      setSelectedId(idx);
      const _signer = await provider.getSigner(accounts[idx].account);
      const _signerAddr = await _signer.getAddress();
      console.log("Signer Address:", _signerAddr);
      setSigner(_signer);
      setMessage("");
      const _myBid = await contract.getMybid(_signerAddr);
      setCurrentBid(ethers.formatEther(_myBid));
      setBidValue(ethers.formatEther(_myBid));
    } catch (error) {
      console.log(error);
    }
  };

  const formatBalance = (balance) => {
    // console.log('balance', balance);
    return Number(ethers.formatEther(balance)).toFixed(6);
  };

  return (
    <Container fluid className="mt-5">
      <Card className="p-4">
        <h2 className="text-center mb-4">Welcome to My Auction!</h2>
        <h5 className="text-center mb-4">Auction Contract Balance:&nbsp;
          <span className="text-info">{contractBalance} ETH</span>
        </h5>
        <AuctionInfo
          context={[auctionInfo.brand, auctionInfo.serialNumber, auctionState]}
        />
        <AccountList
          context={[
            provider,
            isLocalProvider,
            accounts,
            connected,
            selectedId,
            formatBalance,
            handleAccountSelect,
            highestBidder,
          ]}
        />
        <Button
          disabled={connected}
          variant={accounts.length ? "danger" : "primary"}
          className="w-100 mb-3"
          onClick={connectWallet}
        >
          {accounts.length ? "Disconnect" : "Connect Wallet"}
        </Button>
        <BiddingForm
          context={[
            bidValue,
            setBidValue,
            placeBid,
            setMessage,
            currentBid,
            cancelAuction,
            endAuction,
          ]}
        />
        <MessageBox context={[message]} />
        {auctionState === "CANCELLED" || auctionState === "ENDED" ? (
          <WithdrawForm
            context={[withdrawValue, setWithdrawValue, withdrawFunds]}
          />
        ) : null}
        <BidHistory
          context={[
            currentBid,
            highestBid,
            highestBidder,
            bidHistory,
            formatBalance,
          ]}
        />
        <EventHistory context={[events, formatBalance]} />
      </Card>
    </Container>
  );
};

export default MyAuction;

// Step 4: Deploy the smart contract using Hardhat or Ganache
// To deploy with Hardhat, run "npx hardhat run --network localhost scripts/deploy.js" to deploy the contract to a local blockchain.
// To deploy with Ganache, make sure Ganache is running and configured correctly in your hardhat.config.js file.
// Update hardhat.config.js to include:
// networks: {
//   ganache: {
//     url: "http://127.0.0.1:7545",
//     accounts: ["YOUR_PRIVATE_KEY"]
//   }
// }
// Then run "npx hardhat run --network ganache scripts/deploy.js"

// Step 5: Run the Frontend Application
// Make sure you have run your local blockchain first with "npx hardhat node" or start Ganache.
// Run "npm start" to start the React application.