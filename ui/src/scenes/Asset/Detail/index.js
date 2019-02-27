import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Paper, Grid, AppBar, Typography, Toolbar, Button, Chip, Card } from '@material-ui/core';
import { getAssets, getAssetDetail, assetEventRequest, changeOwner } from "../../../actions/asset.actions";
import AuditLog from "../AuditLog";
import PlaceBidModal from "../../Bid/PlaceBidModal";
import SnackbarMessage from '../../../components/SnackbarMessage';
import { getBids, bidEventRequest } from "../../../actions/bid.actions";
import BidTable from "../../Bid/BidTable";
import './detail.css';
import SpecTable from "../Spec";

class AssetDetail extends Component {

  componentDidMount() {
    const sku = this.props.match.params.sku;
    this.props.getAssetDetail(sku);
    this.props.getBids();
  }

  get isRegulator() {
    const { USER_ROLE } = this.props;
    return parseInt(this.props.user['role'], 10) === USER_ROLE.REGULATOR;
  }

  requestBid = (asset) => {
    const { ASSET_EVENT, assetEventRequest, ASSET_STATE, user, USER_ROLE } = this.props;
    const role = parseInt(this.props.user['role'], 10);

    const checkState = (parseInt(asset.assetState, 10) === ASSET_STATE.CREATED) || (parseInt(asset.assetState, 10) === ASSET_STATE.OWNER_UPDATED);
    if (checkState && (user.account === asset.owner) && role !== USER_ROLE.RETAILER) {
      return (
        <Button variant="contained" color="primary" onClick={() => {
          assetEventRequest({ sku: asset.sku, assetEvent: ASSET_EVENT.REQUEST_BIDS })
        }}>
          Request Bids
        </Button>
      )
    }
  }

  placeBid = (asset) => {
    const { account } = this.props.user;
    if (account !== asset.owner) {
      return (
        <PlaceBidModal asset={asset} />
      )
    }
  }

  handleEvent = (address, chainId, bidEvent, initiator) => {
    const { bidEventRequest, changeOwner, asset } = this.props;

    const payload = { address, chainId, bidEvent };
    bidEventRequest(payload);

    if (bidEvent === this.props.BID_EVENT.ACCEPT) {
      changeOwner({ sku: asset.sku, owner: initiator })
    }
  }

  render() {
    const { asset, bids, BID_EVENT, user, BID_STATE, ASSET_STATE } = this.props;
    // Asset State
    const state = asset ? parseInt(asset.assetState) : 0;

    return (
      <div className="asset-container">
        <Grid container>
          <AppBar position="static" color="default">
            <Toolbar>
              <Typography variant="h6" color="inherit" className="appbar-name">
                Asset Detail - {asset && asset.name}
                <Chip label={ASSET_STATE[state]} className="status-chip" />
              </Typography>
              <div className="appbar-content">
                {!this.isRegulator && this.requestBid(asset)}
                {!this.isRegulator && this.placeBid(asset)}
              </div>
            </Toolbar>
          </AppBar>
        </Grid>
        <Grid container spacing={24} className="asset-detail">
          <Grid item xs={1}></Grid>
          <Grid item xs={4}>
            <Paper elevation={1} className="asset-description">
              <Typography variant="h5" component="h3">
                Description
              </Typography>
              <Typography component="p">
                {asset && asset.description}
              </Typography>
            </Paper>

            <Paper elevation={1} className="asset-description asset-spec">
              <Typography variant="h5" component="h3">
                Spec
              </Typography>
              <SpecTable asset={asset} />
            </Paper>
          </Grid>
          <Grid item xs={1}></Grid>
          <Grid item xs={4}>
            <Card>
              <Typography variant="h5" component="h3" className="audit-log">
                Audit Log
              </Typography>
              <AuditLog activeStep={state} history={asset && asset.history} ASSET_STATE={ASSET_STATE} BID_STATE={BID_STATE} />
            </Card>
          </Grid>
          <Grid item xs={2}></Grid>
        </Grid>
        <Grid container spacing={24} className="asset-detail">
          <Grid item xs={1}></Grid>
          <Grid item xs={10}>
            <Paper elevation={1} className="asset-description asset-spec">
              <Typography variant="h5" component="h3">
                Bids
              </Typography>
              <BidTable
                bids={bids}
                BID_EVENT={BID_EVENT}
                BID_STATE={BID_STATE}
                handleEvent={this.handleEvent}
                user={user}
                isRegulator={this.isRegulator}
              />
            </Paper>
          </Grid>
        </Grid>
        <Grid item xs={1}></Grid>
        <SnackbarMessage />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const asset = state.asset.asset;
  const bids = state.bid.bids.filter((bid) => bid.asset === asset.address)

  return {
    asset,
    user: state.authentication.user,
    USER_ROLE: state.constants.TT.TtRole,
    BID_EVENT: state.constants.Bid.BidEvent,
    BID_STATE: state.constants.Bid.BidState,
    ASSET_EVENT: state.constants.Asset.AssetEvent,
    ASSET_STATE: state.constants.Asset.AssetState,
    bids
  };
};

const connected = connect(mapStateToProps, {
  getAssets,
  getBids,
  getAssetDetail,
  assetEventRequest,
  bidEventRequest,
  changeOwner
})(AssetDetail);

export default withRouter(connected);
