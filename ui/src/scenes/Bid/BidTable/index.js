import React, { Component } from "react";
import { Table, TableHead, TableRow, TableCell, TableBody, Button } from '@material-ui/core';
import { Icon, IconButton } from '@material-ui/core';
import moment from 'moment';
import './bidTable.css';

class BidTable extends Component {

  acceptBidButton = (bid, user) => {
    const { handleEvent, bidEvent, bidState } = this.props;
    if (bid.assetOwner === user.account && parseInt(bid.bidState) === bidState.ENTERED) {
      return (
        <IconButton
          aria-label="check"
          title="Accept"
          className="buttons"
          onClick={() => handleEvent(bid.address, bid.chainId, bidEvent.ACCEPT, bid.initiator)}>
          <Icon color="action">check</Icon>
        </IconButton>
      )
    }
  }

  rejectBidButton = (bid, user) => {
    const { handleEvent, bidEvent, bidState } = this.props;
    if (bid.assetOwner === user.account && parseInt(bid.bidState) === bidState.ENTERED) {
      return (
        <IconButton
          aria-label="clear"
          title="Reject"
          className="buttons"
          onClick={() => handleEvent(bid.address, bid.chainId, bidEvent.REJECT, bid.initiator)}>
          <Icon color="action">clear</Icon>
        </IconButton>
      )
    }
  }

  render() {
    const { bids, user } = this.props;

    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Asset Address</TableCell>
            <TableCell>Initiator</TableCell>
            <TableCell>Value</TableCell>
            <TableCell>Time</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bids.map((bid, key) =>
            <TableRow key={key}>
              <TableCell> {bid.asset} </TableCell>
              <TableCell> {bid.initiator} </TableCell>
              <TableCell>{bid.value}</TableCell>
              <TableCell>
                {moment().utc(bid.block_timestamp).local().format('YYYY-MM-DD HH:mm')}
              </TableCell>
              <TableCell>
                {this.acceptBidButton(bid, user)}
                {this.rejectBidButton(bid, user)}
              </TableCell>
            </TableRow>
          )}
          {
            !bids.length &&
            <TableRow>
              <TableCell colSpan={5} align="center"> No bids found </TableCell>
            </TableRow>
          }
        </TableBody>
      </Table>
    )
  }
}

export default BidTable;
