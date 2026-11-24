
import React from "react";
import { Card, ListGroup } from "react-bootstrap";

const BidHistory = (props) => {
  const [currentBid, highestBid, highestBidder, bidHistory, formatBalance] = props.context;
  return (
    <>
      <div className="mt-4">
        <h4 className="text-center">Current Bidder's Bid: <span className="text-secondary">{currentBid}&nbsp;ETH</span></h4>
      </div>
      <div className="mt-4">
        <h4 className="text-center">Current Highest Bid: <span className="text-primary">{highestBid}&nbsp;ETH</span></h4>
      </div>
      <div className="mt-4">
        <h4 className="text-center">Current Highest Bidder: <span className="text-primary">{highestBidder}</span></h4>
      </div>
      <div className="mt-4">
        <Card className="p-3">
          <h4>Bid History</h4>
          <ListGroup variant="flush">
            {bidHistory && bidHistory.length
              ? bidHistory.map((bid, index) => (
                  <ListGroup.Item key={index}>
                    <strong>{bid.bidder}</strong> - {formatBalance(bid.amount)} ETH
                  </ListGroup.Item>
                ))
              : null}
          </ListGroup>
        </Card>
      </div>
    </>
  );
};

export default BidHistory;