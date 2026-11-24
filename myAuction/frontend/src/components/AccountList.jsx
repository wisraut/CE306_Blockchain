import React from "react";
import { Dropdown } from "react-bootstrap";

const AccountList = (props) => {
  const [provider, isLocalProvider, accounts, connected, selectedId, formatBalance, handleAccountSelect, highestBidder] =
    props.context;
  return (provider && isLocalProvider(provider) && accounts.length > 0) ?
    (
      <Dropdown className="mb-3">
        <Dropdown.Toggle variant="secondary" className="w-100">
          {connected && selectedId >= 0
            ? `${accounts[selectedId].account} 
            (${formatBalance(accounts[selectedId].balance)} ETH)`
            : "Select Account"}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {accounts.map((acc, idx) => (
            <Dropdown.Item key={idx} onClick={() => handleAccountSelect(idx)}>
              <span className={String(acc.account).toLowerCase() == String(highestBidder).toLowerCase() ? 
                "text-danger" : null}>{acc.account} ({formatBalance(acc.balance)} ETH)</span>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    ) : null;
};

export default AccountList;