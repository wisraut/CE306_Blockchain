import React from "react";
import { Card, Table } from "react-bootstrap";

const AuctionInfo = (props) => {
  const [brand, serialNumber, auctionState] = props.context;
  return (
    <Card variant="info" className="text-center m-4">
      <Card.Body>
      <Card.Title>Auction Product Information</Card.Title>
      <Table>
        <thead>
          <tr>
            <th>Brand</th>
            <th>Serial Number</th>
            <th>Auction State</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{brand ? brand : "N/A"}</td>
            <td>{serialNumber ? serialNumber : "N/A"}</td>
            <td>{auctionState ? auctionState : "N/A"}</td>
          </tr>
        </tbody>
      </Table>
      </Card.Body>
    </Card>
  );
};

export default AuctionInfo;