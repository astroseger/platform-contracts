"use strict";
var  MultiPartyEscrow = artifacts.require("./MultiPartyEscrow.sol");

let Contract = require("truffle-contract");
let TokenAbi = require("singularitynet-token-contracts/abi/SingularityNetToken.json");
let TokenNetworks = require("singularitynet-token-contracts/networks/SingularityNetToken.json");
let TokenBytecode = require("singularitynet-token-contracts/bytecode/SingularityNetToken.json");
let Token = Contract({contractName: "SingularityNetToken", abi: TokenAbi, networks: TokenNetworks, bytecode: TokenBytecode});
Token.setProvider(web3.currentProvider);

var ethereumjsabi  = require('ethereumjs-abi');
var ethereumjsutil = require('ethereumjs-util');
let signFuns       = require('./sign_mpe_funs');



async function testErrorRevert(prom)
{
    let rezE = -1
    try { await prom }
    catch(e) {
        rezE = e.message.indexOf('revert') 
    }
    assert(rezE >= 0, "Must generate error and error message must contain revert");
}
  
contract('MultiPartyEscrow', function(accounts) {

    var escrow;
    var tokenAddress;
    var token;
    let N1 = 42000000000
    let N2 = 420000000000
    let Nc = 1000     

    before(async () => 
        {
            escrow        = await MultiPartyEscrow.deployed();
            tokenAddress  = await escrow.token.call();
            token         = Token.at(tokenAddress);
        });


    it ("Test Simple wallet 1", async function()
        { 
           //Deposit 42000 from accounts[0]
            await token.approve(escrow.address,N1, {from:accounts[0]});
            await escrow.deposit(N1, {from:accounts[0]});
            assert.equal((await escrow.balances.call(accounts[0])).toNumber(), N1)

            //Deposit 420000 from accounts[4] (frist we need transfert from a[0] to a[4])
            await token.transfer(accounts[4],  N2, {from:accounts[0]});
            await token.approve(escrow.address,N2, {from:accounts[4]}); 
            await escrow.deposit(N2, {from:accounts[4]});
            
            assert.equal((await escrow.balances.call(accounts[4])).toNumber(), N2)

            assert.equal((await token.balanceOf(escrow.address)).toNumber(), N1 + N2)
           
       }); 

        it ("Try to open 100000 channels", async function()
        {
            var rez;
            for (var a = 0; a < 10; a++)
            {
            let expiration   = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 10000000
            let value        = 1000
            let replicaId    = 44

            await token.transfer(accounts[a],  10000000, {from:accounts[0]});
            await token.approve(escrow.address,10000000, {from:accounts[a]});
            await escrow.deposit(1000000, {from:accounts[a]});


            for (var i = 0; i < 100; i++) 
            {

               await escrow.openChannel(accounts[5], value, expiration, replicaId, {from:accounts[a]})
                //rez = await escrow.getSenderChannelsArray({from:accounts[a]})
                //console.log(rez)
                //console.log(" ")
            }
            }
        });

});

