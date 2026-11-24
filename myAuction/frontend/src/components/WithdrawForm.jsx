import React from 'react'
import { Form, Button } from 'react-bootstrap'

const WithdrawForm = (props) => {
  const [withdrawValue, setWithdrawValue, withdrawFunds] = props.context;
  return (
    <Form className="mt-4">
    {/* <Form.Group>
      <Form.Label>Withdraw Amount (ETH)</Form.Label>
      <Form.Control
        type="text"
        placeholder="Enter amount to withdraw in ETH"
        value={withdrawValue}
        onChange={(e) => setWithdrawValue(e.target.value)} />
    </Form.Group> */}
    <Button variant="danger" className="w-100 mt-3" onClick={withdrawFunds}>
      Withdraw Funds
    </Button>
  </Form>
  )
}

export default WithdrawForm