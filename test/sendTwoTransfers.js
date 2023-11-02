const {Api, JsonRpc, RpcError} = require('eosjs');
const {JsSignatureProvider} = require('eosjs/dist/eosjs-jssig');      // development only
const fetch = require('node-fetch');                                    // node only; not needed in browsers
const {TextEncoder, TextDecoder} = require('util');
const fs = require("fs");

const sendTwoTransfers = async ({
                                    tokenContract1 = 'REDACTED',
                                    tokenContract2 = 'REDACTED',
                                    quantity2 = '1.00000 USDCASH',
                                    quantity1 = '80.00000 RUBCASH',
                                    from,
                                    swapSCName = 'REDACTED',
                                    memo = 'deposit:2'
                                }) => {
    const privateKeys = [from.privateKey];
    const signatureProvider = new JsSignatureProvider(privateKeys)
    const rpc = new JsonRpc('https://eos.REDACTEDonline', {fetch})
    const api = new Api({rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder()})

    let twoTransfersJson = {
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
                quantity: quantity1,
                memo: memo
            }
        },
            {
                account: tokenContract2,
                name: 'transfer',
                authorization: [{
                    actor: from.name,
                    permission: 'active',
                }],
                data: {
                    from: from.name,
                    to: swapSCName,
                    quantity: quantity2,
                    memo: memo
                }
            }]
    }

    try {
        const result = await api.transact(twoTransfersJson, {
            blocksBehind: 3,
            expireSeconds: 30,
        })
        console.log(result)
        if (result.processed.receipt.status === 'executed' && memo === 'deposit:2') {
            let data = fs.readFileSync('test/results/deposits.json', 'utf8')
            let obj = JSON.parse(data)
            obj.deposits.push({id: result.transaction_id})
            let json = JSON.stringify(obj); //convert it back to json
            await fs.writeFile('test/results/deposits.json', json, function () {
            });
        }
    } catch (e) {
        console.log('\nCaught exception: ' + e);
        if (e instanceof RpcError) {
            console.log(JSON.stringify(e.json, null, 2));
        }
        // throw e
    }
}

module.exports = sendTwoTransfers;