const {Api, JsonRpc, RpcError} = require('eosjs');
const {JsSignatureProvider} = require('eosjs/dist/eosjs-jssig');      // development only
const fetch = require('node-fetch');                                    // node only; not needed in browsers
const {TextEncoder, TextDecoder} = require('util');

const powerUp = async ({
                        tokenContract1 = 'eosio',
                        from,
                        receiver,
                    }) => {
    const privateKeys = [from.privateKey];
    const signatureProvider = new JsSignatureProvider(privateKeys)
    const rpc = new JsonRpc('https://eos.REDACTEDonline', {fetch})
    const api = new Api({rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder()})

    let transferJson = {
        actions: [{
            account: tokenContract1,
            name: 'powerup',
            authorization: [{
                actor: from.name,
                permission: 'active',
            }],
            data: {
                cpu_frac: 99999612,
                days: 1,
                max_payment: '0.0708 EOS',
                net_frac: 2070,
                payer: from.name,
                receiver: receiver.name
            }
        }]
    }

    try {
        const result = await api.transact(transferJson, {
            blocksBehind: 3,
            expireSeconds: 30,
        })
        console.log(result)
    } catch (e) {
        console.log('\nCaught exception: ' + e);
        if (e instanceof RpcError) {
            console.log(JSON.stringify(e.json, null, 2));
        }
        throw e
    }
}

module.exports = powerUp;