const {Api, JsonRpc, RpcError} = require('eosjs');
const {JsSignatureProvider} = require('eosjs/dist/eosjs-jssig');      // development only
const fetch = require('node-fetch');                                    // node only; not needed in browsers
const {TextEncoder, TextDecoder} = require('util');

const openLqBalance = async ({
                                 token = '0,REDACTED',
                                 from,
                                 ramPayer = from,
                                 swapSCName = 'REDACTED'
                             }) => {
    const privateKeys = [ramPayer.privateKey];
    const signatureProvider = new JsSignatureProvider(privateKeys)
    const rpc = new JsonRpc('https://eos.REDACTEDonline', {fetch})
    const api = new Api({rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder()})

    let openLqBalanceJson = {
        actions: [{
            account: swapSCName,
            name: 'open',
            authorization: [{
                actor: ramPayer.name,
                permission: 'active',
            }],
            data: {
                owner: from.name,
                symbol: token,
                ram_payer: ramPayer.name
            }
        }]
    }

    try {
        const result = await api.transact(openLqBalanceJson, {
            blocksBehind: 3,
            expireSeconds: 30,
        })
        console.log(result)
    } catch (e) {
        console.log('\nCaught exception: ' + e);
        if (e instanceof RpcError) {
            console.log(JSON.stringify(e.json, null, 2));
        }
    }
}

module.exports = openLqBalance;