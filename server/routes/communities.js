var express = require('express');
var bodyParser = require("body-parser");
var router = express.Router();
var Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545/"));
const abi = [{"constant":true,"inputs":[],"name":"senderIsOracle","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"v","type":"uint256"}],"name":"uintToBytes","outputs":[{"name":"ret","type":"bytes32"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"name":"newOracle","type":"address"}],"name":"addOracle","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_tranches","type":"address"},{"name":"_accounts","type":"address"},{"name":"_communities","type":"address"},{"name":"_vendors","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"oracleAddress","type":"address"}],"name":"OracleAdded","type":"event"},{"constant":false,"inputs":[{"name":"_tranches","type":"address"}],"name":"updateTrancheContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_accounts","type":"address"}],"name":"updateAccountsContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_communities","type":"address"}],"name":"updateCommunitiesContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_vendors","type":"address"}],"name":"updateVendorsContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_amount","type":"uint256"},{"name":"_url","type":"string"}],"name":"give","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_rewardId","type":"uint256"}],"name":"spend","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_accountId","type":"uint256"}],"name":"replenish","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getCommunityCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_id","type":"uint256"}],"name":"communityForId","outputs":[{"components":[{"name":"id","type":"uint256"},{"name":"adminAddress","type":"address"},{"name":"isClosed","type":"bool"},{"name":"domain","type":"string"},{"name":"metadata","type":"string"},{"name":"tags","type":"string"},{"name":"accountIds","type":"uint256[]"}],"name":"","type":"tuple"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_adminAddress","type":"address"},{"name":"_isClosed","type":"bool"},{"name":"_domain","type":"string"},{"name":"_metadata","type":"string"},{"name":"_tags","type":"string"}],"name":"addCommunity","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_communityId","type":"uint256"},{"name":"_tags","type":"string"}],"name":"setTags","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_communityId","type":"uint256"},{"name":"_url","type":"string"},{"name":"_metadata","type":"string"}],"name":"addAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_communityId","type":"uint256"},{"name":"_metadata","type":"string"},{"name":"_address","type":"address"}],"name":"addVendor","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_vendorId","type":"uint256"},{"name":"_cost","type":"uint256"},{"name":"_tag","type":"string"},{"name":"_metadata","type":"string"}],"name":"addReward","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];
const contract = new web3.eth.Contract(abi, "0x314f93579a528fc3dd979e2074a1ee555f48943a");

var communities = [];

/* GET community list. */
router.get('/', function(req, res, next) {
  list_communities( function(err, val) {
    if (err) {
      // res.json( {"err": err} );
    } else {
      // res.json( {"res": val} );
    }
  });  
  res.json(communities);
});

function list_communities(callback) {
  var method = contract.methods.getCommunityCount();
  method.call(function(error, result) {
    if (error) {
      console.log('error', error);
      callback(error, null);
    } else {
      console.log('result', result);
      callback(null, result);
    }
  })
  .catch(function(error) {
    console.log('call error ' + error);
    callback(error, null);
  });
};

/* GET community details. */
router.get('/:id', function(req, res, next) {
  for (var i=0; i<communities.length; i++) {
    if (parseInt(communities[i].id) === parseInt(req.params.id)) {
      return res.json(communities[i]);
    }
  }
  res.json({metadata:{ name: "n/a"}});
});

/* POST new community. */
router.post('/create', function(req, res, next) {
  var community = req.body.community;
  if (community.id == 0) {
    community.id = communities.length + 1;
    communities.push(community);
  }
  var method = contract.methods.addCommunity(
    community.adminAddress || web3.eth.accounts[0],
    community.isClosed,
    community.domain,
    community.metadata,
    community.tags
  );
  method.call(function(error, result) {
    if (error) {
      console.log('error', error);
      callback(error, null);
    } else {
      console.log('result', result);
      res.json(community);
    }
  })
  .catch(function(error) {
    console.log('call error ' + error);
    callback(error, null);
  });
});

/* PUT edit community. */
router.put('/update', function(req, res, next) {
  var community = req.body.community;
  for (var i=0; i<communities.length; i++) {
    if (parseInt(communities[i].id) === parseInt(community.id)) {
      communities[i] = community;
      return res.json(communities[i]);
    }
  }
  res.json({metadata:{ name: "n/a"}});
});

module.exports = router;