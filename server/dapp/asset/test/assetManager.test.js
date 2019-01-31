require('co-mocha');

const { common, rest6: rest } = require('blockapps-rest');
const { assert, config, util } = common;

const RestStatus = rest.getFields(`${process.cwd()}/${config.libPath}/rest/contracts/RestStatus.sol`);
const TtError = rest.getEnums(`${process.cwd()}/${config.dappPath}/asset/TtError.sol`).TtError;
const AssetState = rest.getEnums(`${process.cwd()}/${config.dappPath}/asset/contracts/AssetState.sol`).AssetState;
const AssetEvent = rest.getEnums(`${process.cwd()}/${config.dappPath}/asset/contracts/AssetEvent.sol`).AssetEvent;

const ttPermissionManagerJs = require(`${process.cwd()}/${config.dappPath}/ttPermission/ttPermissionManager`);
const assetManagerJs = require(`${process.cwd()}/${config.dappPath}/asset/assetManager`);
const assetJs = require(`${process.cwd()}/${config.dappPath}/asset/asset`);
const assetFactory = require(`${process.cwd()}/${config.dappPath}/asset/asset.factory`);


const TEST_TIMEOUT = 60000;

// TODO: TT-5 replace with predefined OAuth tokens
const adminName = util.uid('Admin');
const adminPassword = '1234';

const masterName = util.uid('Master');
const masterPassword = '1234';

const manufacturerName = util.uid('Manufacturer');
const manufacturerPassword = '1234';

const distributorName = util.uid('Distributor');
const distributorPassword = '1234';


describe('Asset Manager Tests', function () {
  this.timeout(TEST_TIMEOUT);

  let adminUser, masterUser, manufacturerUser, distributorUser;
  let assetManagerContract, manufacturerAssetManagerContract, distributorAssetManagerContract;

  function bindAssetManagerContractToUser(user, contract) {
    let copy = Object.assign({}, contract);

    return assetManagerJs.bind(user, copy);
  }

  before(function* () {
    adminUser = yield rest.createUser(adminName, adminPassword);
    yield rest.fill(adminUser, true);

    masterUser = yield rest.createUser(masterName, masterPassword);

    manufacturerUser = yield rest.createUser(manufacturerName, manufacturerPassword);
    yield rest.fill(manufacturerUser, true);

    distributorUser = yield rest.createUser(distributorName, distributorPassword);
    yield rest.fill(distributorUser, true);

    const ttPermissionManager = yield ttPermissionManagerJs.uploadContract(adminUser, masterUser);
    assetManagerContract = yield assetManagerJs.uploadContract(adminUser, ttPermissionManager);

    yield ttPermissionManager.grantManufacturerRole(manufacturerUser);
    yield ttPermissionManager.grantDistributorRole(distributorUser);

    manufacturerAssetManagerContract = bindAssetManagerContractToUser(manufacturerUser, assetManagerContract);
    distributorAssetManagerContract = bindAssetManagerContractToUser(distributorUser, assetManagerContract);
  });

  it('Does Asset Exist -- asset does not exist ', function* () {
    const uid = util.iuid()

    const exists = yield assetManagerContract.exists(uid);
    assert.equal(exists, false, 'contract does not exists');
  });

  it('Create Asset -- unauthorized', function* () {
    const assetArgs = assetFactory.getAssertArgs();

    yield assert.shouldThrowRest(function* () {
      yield distributorAssetManagerContract.createAsset(assetArgs);
    }, RestStatus.UNAUTHORIZED, TtError.NULL);
  });

  it('Create Asset', function* () {
    const assetArgs = assetFactory.getAssertArgs();

    const asset = yield manufacturerAssetManagerContract.createAsset(assetArgs);

    assert.equal(asset.uid, assetArgs.uid, 'uid');
  });

  it('Create Asset -- empty uid', function* () {
    const assetArgs = assetFactory.getAssertArgs({
      uid: ''
    });

    yield assert.shouldThrowRest(function* () {
      yield manufacturerAssetManagerContract.createAsset(assetArgs);
    }, RestStatus.BAD_REQUEST, TtError.UID_EMPTY);
  });

  it('Create Asset -- already exists', function* () {
    const assetArgs = assetFactory.getAssertArgs();

    yield manufacturerAssetManagerContract.createAsset(assetArgs);

    yield assert.shouldThrowRest(function* () {
      yield manufacturerAssetManagerContract.createAsset(assetArgs);
    }, RestStatus.BAD_REQUEST, TtError.UID_EXISTS);
  });

  it('Handle Asset Event', function* () {
    const assetArgs = assetFactory.getAssertArgs();
    const asset = yield manufacturerAssetManagerContract.createAsset(assetArgs);
    const assetContract = assetJs.bindAddress(manufacturerUser, asset.address);

    const assertHandleAssertEvent = function* (assetEvent, expectedState) {
      const handleAssetEventArgs = {
        uid: assetArgs.uid,
        assetEvent,
      };
      
      const newState = yield manufacturerAssetManagerContract.handleAssetEvent(handleAssetEventArgs);
      assert.equal(newState, expectedState, 'returned new state');

      const state = yield assetContract.getState();
      assert.equal(state.assetState, expectedState, 'new state');
    }

    yield assertHandleAssertEvent(AssetEvent.REQUEST_BIDS, AssetState.BIDS_REQUESTED);
    yield assertHandleAssertEvent(AssetEvent.CHANGE_OWNER, AssetState.OWNER_UPDATED);
  });

  it('Handle Asset Event -- invalid event', function* () {
    const assetArgs = assetFactory.getAssertArgs();
    yield manufacturerAssetManagerContract.createAsset(assetArgs);

    const handleAssetEventArgs = {
      uid: assetArgs.uid,
      assetEvent: AssetEvent.CHANGE_OWNER,
    };

    yield assert.shouldThrowRest(function* () {
      yield manufacturerAssetManagerContract.handleAssetEvent(handleAssetEventArgs);
    }, RestStatus.BAD_REQUEST, TtError.NULL);
  });

  it('Handle Asset Event -- asset not fonund', function* () {
    const assetArgs = assetFactory.getAssertArgs();
    const handleAssetEventArgs = {
      uid: assetArgs.uid,
      assetEvent: AssetEvent.REQUEST_BIDS,
    };

    yield assert.shouldThrowRest(function* () {
      yield manufacturerAssetManagerContract.handleAssetEvent(handleAssetEventArgs);
    }, RestStatus.NOT_FOUND, TtError.UID_NOT_FOUND);
  });
});