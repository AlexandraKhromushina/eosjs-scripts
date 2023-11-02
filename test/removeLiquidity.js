const {Api, JsonRpc, RpcError} = require('eosjs');
const {JsSignatureProvider} = require('eosjs/dist/eosjs-jssig');      // development only
const fetch = require('node-fetch');                                    // node only; not needed in browsers
const {TextEncoder, TextDecoder} = require('util');
const fs = require("fs");

const removeLiquidity = async ({
                                   quantity1 = '100 REDACTED',
                                   from,
                                   swapSCName = 'REDACTED',
                               }) => {
    const privateKeys = [from.privateKey];
    const signatureProvider = new JsSignatureProvider(privateKeys)
    const rpc = new JsonRpc('https://eos.REDACTEDonline', {fetch})
    const api = new Api({rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder()})

    let removeLiquidityJson = {
        actions: [{
            account: swapSCName,
            name: 'withdraw',
            authorization: [{
                actor: from.name,
                permission: 'active',
            }],
            data: {
                owner: from.name,
                lq_tokens: quantity1,
            }
        }]
    }

    try {
        const result = await api.transact(removeLiquidityJson, {
            blocksBehind: 3,
            expireSeconds: 30,
        })
        console.log(result)
        if (result.processed.receipt.status === 'executed') {
            let data = fs.readFileSync('test/results/withdraws.json', 'utf8')
            let obj = JSON.parse(data)
            obj.withdraws.push({id: result.transaction_id})
            let json = JSON.stringify(obj); //convert it back to json
            await fs.writeFile('test/results/withdraws.json', json, function () {
            });
        }
    } catch (e) {
        console.log('\nCaught exception: ' + e);
        if (e instanceof RpcError) {
            console.log(JSON.stringify(e.json, null, 2));
        }
    }
}

module.exports = removeLiquidity;