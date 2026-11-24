import React from "react";
import { Form, Button, Row, Col, Container } from "react-bootstrap";

function BiddingForm(props) {
  const [bidValue, setBidValue, placeBid, setMessage, currentBid, cancelAuction, endAuction] =
    props.context;
  const clearInput = () => {
    setBidValue(currentBid);
    setMessage("");
  };
  return (
    <Form className="mt-3">
      <Form.Group>
        <Form.Label>Bid Amount (ETH)</Form.Label>
        <Form.Control
          type="number"
          placeholder="Enter bid amount"
          value={bidValue}
          onChange={(e) => setBidValue(e.target.value)}
        />
      </Form.Group>
      {/* <div className="d-flex justify-content-between mt-3"> */}
      <Container fluid className="m-4 justify-content-center">
        <Row>
          <Col>
            <Button variant="success" onClick={placeBid}>
              Place Bid
            </Button>
          </Col>
          <Col>
            <Button variant="warning" onClick={clearInput}>
              Reset Bid
            </Button>
          </Col>
          <Col>
            <Button variant="danger" onClick={cancelAuction}>
              Cancel Bid
            </Button>
          </Col>
          <Col>
            <Button variant="dark" onClick={endAuction}>
              End Bid
            </Button>
          </Col>
        </Row>
      </Container>
      {/* </div> */}
    </Form>
  );
}

export default BiddingForm;
