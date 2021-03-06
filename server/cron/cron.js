#! /usr/bin/env node

require('dotenv').config();

var eth = require('../routes/eth');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const REFRESH_WINDOW = 20 * 60 * 24 * 7;

var fromAccount;
var blockNumber;

console.log("ykarma", process.env.YKARMA_ADDRESS);
eth.web3.eth.getAccounts().then((ethAccounts) => {
  fromAccount = ethAccounts[0];
  eth.web3.eth.getBlockNumber((error, bn) => {
    console.log("blockNumber", bn);
    blockNumber = bn;
    doReplenish();
  });
})

function doReplenish() {
  var method = eth.contract.methods.getCommunityCount();
  method.call(function(error, result) {
    if (error) {
      console.log('getCommunityCount error', error);
    } else {
      console.log('getCommunityCount result', result);
      for (var i = 0; i < result; i++) {
        eth.getCommunityFor(i+1, (community) => {
          replenishCommunity(community);
        });
      }
    }
  })
  .catch(function(error) {
    console.log('getCommunityCount call error', error);
  });
}

function replenishCommunity(community) {
  console.log('replenishing community', community.id);
  var method = eth.contract.methods.getAccountCount(community.id);
  method.call(function(error, result) {
    if (error) {
      console.log('replenishCommunity getAccountCount error', error);
    } else {
      for (var i = 0; i < result; i++) {
        getAccountWithinCommunity(community.id, i, (account) => {
          if (account.flags !== '0x0000000000000000000000000000000000000000000000000000000000000001') { // if not newly created by receipt
            replenishAccount(account);
          }
        });
      }
    }
  })
  .catch(function(error) {
    console.log('replenishCommunity getAccountCount call error', error);
  });
}

function getAccountWithinCommunity(communityId, idx, callback) {
  var method = eth.contract.methods.accountWithinCommunity(communityId, idx);
  method.call(function(error, result) {
    if (error) {
      console.log('accountWithinCommunity error', error);
    } else {
      var account = eth.getAccountFromResult(result);
      callback(account);
    }
  })
  .catch(function(error) {
    console.log('accountWithinCommunity call error ' + id, error);
    callback({});
  });
}

function replenishAccount(account) {
  var lastReplenished = eth.contract.methods.lastReplenished(account.id);
  lastReplenished.call(function(error, latest) {
    if (latest > 0 && blockNumber - latest < REFRESH_WINDOW) {
      console.log("not replenishing account", account.id);
      return;
    }
    console.log("replenishing account", account.id);
    var replenish = eth.contract.methods.replenish(account.id);
    var notify = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod';
    replenish.estimateGas({gas: eth.GAS}, function(estError, gasAmount) {
      if (estError) {
        console.log('estimation error', estError);
        return;
      }
      replenish.send({from:fromAccount, gas: gasAmount * 2}).on('error', (error) => {
        console.log('replenish error', error);
      })
      .on('confirmation', (number, receipt) => {
        if (notify) {
          notify = false;
          var metadata = account.metadata || {};
          var emailPrefs = metadata.emailPrefs || {};
          if (emailPrefs.wk !== 0) {
            sendReplenishEmail(account);
          }
        }
      })
      .catch(function(error) {
        console.log('replenish send call error ' + error);
      });
    })
    .catch(function(error) {
      console.log('replenish gas estimation call error', error);
    });
  });
}

function sendReplenishEmail(account) {
  console.log("sending email to", account.urls);
  if (process.env.NODE_ENV === "test") return;
  var recipientEmail = "";
  if (account.urls && account.urls.indexOf("mailto") > 0) {
    const urls = account.urls.split("||");
    for (var i in urls) {
      if (urls[i].startsWith("mailto:")) {
        recipientEmail = urls[i].replace("mailto:","");
      }
    }
  }
  if (recipientEmail === "") return;
  const msg = {
    to: recipientEmail,
    from: 'do-not-respond@ykarma.com',
    subject: `Your YKarma has been replenished!`,
    text: `
You now have 100 more YKarma to give away!
Log into https://www.ykarma.com/ to give it to the deserving or even the not-so-deserving.

YKarma
https://www.ykarma.com/
`,
    html: `
<p>You now have 100 more YKarma to give away!</p>
<p><a href="https://www.ykarma.com/">Log in to YKarma</a> to give it to the deserving or even the not-so-deserving.</p>
<hr/>
<a href="https://www.ykarma.com/">YKarma</a>
`,
  };
  sgMail.send(msg);
}

