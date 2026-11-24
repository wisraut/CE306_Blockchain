import React from 'react'
import { Alert } from 'react-bootstrap';

const MessageBox = props => {
  const [message] = props.context;
  return (
    message && (
      <Alert variant="warning" className="mt-3">
        {message}
      </Alert>
    )
  )
}


export default MessageBox