var DappToken = artifacts.require("DappToken");
var DappTokenSale = artifacts.require("DappTokenSale");


contract('DappTokenSale', function(accounts){
	var tokenSaleInstance;
	var tokenInstance;
	var admin = accounts[0];
	var buyer = accounts[1];
	var tokenPrice = 1000000000000000;
	var numberOfTokens;

	it('initalizes contract with the correct values',function() {
		return DappTokenSale.deployed().then(function(instance) {
			tokenSaleInstance = instance;
			return tokenSaleInstance.address
		}).then(function(address){
			assert.notEqual(address, 0x0, 'has contract address')
			return tokenSaleInstance.tokenContract();
		}).then(function(address){
			assert.notEqual(address, 0x0, 'has contract address');
			return tokenSaleInstance.tokenPrice();
		}).then(function (price) {
			// body...
			assert.equal(price, tokenPrice, 'token price is correct');
		});
	});

	it('facilitates token buying',function(){
		return DappToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return DappTokenSale.deployed();
			}).then(function(instance){
				tokenSaleInstance = instance;
				
				numberOfTokens = 10;
				return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: numberOfTokens * tokenPrice})

			}).then(function (receipt) {

			assert.equal(receipt.logs.length, 1, 'triggers one event');
			assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
			assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
			assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the number of tokens purchased');
			return tokenSaleInstance.tokensSold();
			// body...
		}).then(function (amount) {
			// body...
			assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');
			return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: 1 })
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');
		});
	});

	it('ends token sale',function(){
		return DappTokenSale.deployed().then(function(instance) {
			tokenInstance = instance;
			return DappTokenSale.deployed();
			}).then(function(instance){
				tokenSaleInstance = instance;
				return tokenSaleInstance.endSale({from:buyer});
			}).then(assert.fail).catch(function(error){
				assert(error.message.indexOf('revert' >=0, 'must bne admin to end the sale'));
				return tokenSaleInstance.endSale({from:admin});
			}).then(function(receipt){
				return tokenInstance.balanceOf(admin);
			}).then(function(balance){
				assert.equal(balance.toNumber(),999990, 'returns all unsold dapp tokens to admin');
				return tokenSaleInstance.tokenPrice();
			}).then(function(price){
				assert.equal(price.toNumber(), 0 , 'self destruct');
			});
	});
});