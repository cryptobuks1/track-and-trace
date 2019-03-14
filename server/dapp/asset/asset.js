const { rest6: rest, common } = require('blockapps-rest');
const { util, config } = common;

const contractName = 'Asset';
const contractFilename = `${process.cwd()}/${config.dappPath}/asset/contracts/Asset.sol`;
const encodingHelpers = require('../../helpers/encoding');

async function uploadContract(token, ttPermissionManagerContract, args) {
  const getKeyResponse = await rest.getKey(token);
  
  const contractArgs = Object.assign(
    {}, 
    toBytes32(args), 
    {
      ttPermissionManager: ttPermissionManagerContract.address,
      owner: getKeyResponse.address 
    }
  );

  const contract = await rest.uploadContract(
    token, 
    contractName, 
    contractFilename, 
    util.usc(contractArgs)
  );
  contract.src = 'removed';

  return bind(token, contract);
}

function bind(token, contract) {
  contract.getState = async function() {
    return await rest.getState(contract);
  };

  return contract;
}

function bindAddress(token, address) {
  let contract = {
    name: contractName,
    address
  }
  return bind(token, contract);
}

async function waitForRequiredUpdate(sku, searchCounter) {
  const queryString = `${contractName}?and=(sku.eq.${sku},searchCounter.gte.${searchCounter})`;
  const results = await rest.waitQuery(queryString, 1);

  const asset = fromBytes32(results[0])

  return asset;
}

function fromBytes32(asset) {
  const converted = {
    ...asset,
    keys: asset.keys.map(k => encodingHelpers.fromBytes32(k)),
    values: asset.values.map(v => encodingHelpers.fromBytes32(v))
  }
  return converted
}

function toBytes32(asset) {
  const converted = {
    ...asset,
    keys: asset.keys.map(k => encodingHelpers.toBytes32(k)),
    values: asset.values.map(v => encodingHelpers.toBytes32(v))
  }
  return converted
}

module.exports = {
  uploadContract,
  bindAddress,
  contractName,
  waitForRequiredUpdate,
  fromBytes32,
  toBytes32
}
