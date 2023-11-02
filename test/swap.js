const {Api, JsonRpc, RpcError} = require('eosjs');
const {JsSignatureProvider} = require('eosjs/dist/eosjs-jssig');      // development only
const fetch = require('node-fetch');                                    // node only; not needed in browsers
const {TextEncoder, TextDecoder} = require('util');
const fs = require("fs");

const swap = async ({
                        tokenContract1 = 'REDACTED',
                        quantity = '0.10000 USDCASH',
                        from,
                        swapSCName = 'REDACTED',
                        memo = 'swap:2'
                    }) => {
    const privateKeys = [from.privateKey];
    const signatureProvider = new JsSignatureProvider(privateKeys)
    const rpc = new JsonRpc('https://eos.REDACTEDonline', {fetch})
    const api = new Api({rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder()})

    let transferJson = {
        actions: [{
            account: tokenContract1,
            name: 'transfer',
            authorization: [{
                actor: from.name,
                permission: 'active',
            }],
            data: {
                from: from.name,
                to: swapSCName,
                quantity: quantity,
                memo: memo
            }
        }]
    }

    try {
        const result = await api.transact(transferJson, {
            blocksBehind: 3,
            expireSeconds: 30,
        })
        console.log(result)
        if (result.processed.receipt.status === 'executed') {
            if (memo === 'swap:2') {
                let data = fs.readFileSync('test/results/swaps.json', 'utf8')
                let obj = JSON.parse(data)
                obj.swaps.push({id: result.transaction_id})
                let json = JSON.stringify(obj); //convert it back to json
                await fs.writeFile('test/results/swaps.json', json, function () {
                });
            } else if (memo === 'transfer') {
                let data = fs.readFileSync('test/results/transfers.json', 'utf8')
                let obj = JSON.parse(data)
                obj.transfers.push({id: result.transaction_id})
                let json = JSON.stringify(obj); //convert it back to json
                await fs.writeFile('test/results/transfers.json', json, function () {
                });
            }
        }
    } catch (e) {
        console.log('\nCaught exception: ' + e);
        if (e instanceof RpcError) {
            console.log(JSON.stringify(e.json, null, 2));
        }
        throw e
    }
}

module.exports = swap;