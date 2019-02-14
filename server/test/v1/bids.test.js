require('dotenv').config();
require('co-mocha');

const { rest6: rest, common } = require('blockapps-rest');
const { assert, config } = common;

const { getEmailIdFromToken, createStratoUser } = require(`${process.cwd()}/helpers/oauth`);
const { get, post } = require(`${process.cwd()}/test/helpers/rest`);
const endpoints = require(`${process.cwd()}/api/v1/endpoints`);

const TtRole = rest.getEnums(`${process.cwd()}/${config.dappPath}/ttPermission/contracts/TtRole.sol`).TtRole;
const assetFactory = require(`${process.cwd()}/${config.dappPath}/asset/asset.factory`);

const adminToken = process.env.ADMIN_TOKEN;
const manufacturerToken = process.env.MANUFACTURER_TOKEN;

const TEST_TIMEOUT = 60000;

describe('Bids End-To-End Tests', function () {
  this.timeout(TEST_TIMEOUT);
  let asset, bidsList;

  const createUser = function* (userToken, role) {
    try {
      const user = yield get(endpoints.Users.me, userToken);
      assert.equal(user.role, role, 'user already created with different role');
    } catch (err) {
      console.log(err);
      const userEmail = getEmailIdFromToken(userToken);
      const createAccountResponse = yield createStratoUser(userToken, userEmail);
      const createTtUserArgs = {
        account: createAccountResponse.address,
        username: userEmail,
        role: role
      };
      yield post(endpoints.Users.users, createTtUserArgs, adminToken);
    }
  }

  before(function* () {
    assert.isDefined(adminToken, 'admin token is not defined');
    assert.isDefined(manufacturerToken, 'manufacturer token is not defined');
    yield createUser(manufacturerToken, TtRole.MANUFACTURER);

    const createAssetArgs = assetFactory.getAssetArgs();
    asset = yield post(endpoints.Assets.assets, { asset: createAssetArgs }, manufacturerToken);
    assert.equal(asset.sku, createAssetArgs.sku);
  });

  it('Create Bid', function* () {
    const bidValue = 10;
    response = yield post(endpoints.Bids.bids, { address: asset.address, owner: asset.owner, bidValue }, manufacturerToken);

    assert.equal(response.owner, asset.owner);
    assert.equal(response.address, asset.owner);
    assert.isAtLeast(asset.length, 1, 'create bid list');
  });

  it('list bids', function* () {
    bidsList = yield get(endpoints.Bids.bids, manufacturerToken);
    assert.isAtLeast(bidsList.length, 1, 'bids should be at least 1');
  });

  it('Get bids using address', function* () {
    const url = `${endpoints.Bids.bids}/${bidsList[0].address}`;
    const bidDetail = yield get(url, manufacturerToken);
    assert.isDefined(bidDetail, 'bid detail using address');
  });

  // TODO: Write testcase for handleEvents

});
