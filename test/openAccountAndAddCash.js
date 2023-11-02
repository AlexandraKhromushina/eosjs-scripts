const {Api, JsonRpc, RpcError} = require('eosjs');
const {JsSignatureProvider} = require('eosjs/dist/eosjs-jssig');      // development only
const fetch = require('node-fetch');                                    // node only; not needed in browsers
const {TextEncoder, TextDecoder} = require('util');

const openAccountAndAddCash = async ({
                                         tokenContractName = 'REDACTED',
                                         quantity1 = '1.00000 USDCASH',
                                         quantity2 = '80.00000 RUBCASH',
                                         newAccount,
                                         from
                                     }) => {
    let memo = ''
    const privateKeys = [from.privateKey];
    const signatureProvider = new JsSignatureProvider(privateKeys)
    const rpc = new JsonRpc('https://eos.REDACTEDonline', {fetch})
    const api = new Api({
        rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder()
    })

    try {
        const result = await api.transact({
            actions: [{
                account: 'eosio',
                name: 'newaccount',
                authorization: [{
                    actor: from.name,
                    permission: 'active',
                }],
                data: {
                    creator: from.name,
                    name: newAccount.name, // insert random name here
                    owner: {
                        threshold: 1,
                        keys: [{
                            key: newAccount.publicKey,
                            weight: 1
                        }],
                        accounts: [],
                        waits: []
                    },
                    active: {
                        threshold: 1,
                        keys: [{
                            key: newAccount.publicKey,
                            weight: 1
                        }],
                        accounts: [],
                        waits: []
                    },
                },
            },
                {
                    account: 'eosio',
                    name: 'buyrambytes',
                    authorization: [{
                        actor: from.name,
                        permission: 'active',
                    }],
                    data: {
                        payer: from.name,
                        receiver: newAccount.name,
                        bytes: 5000,
                    },
                },
                {
                    account: tokenContractName,
                    name: 'transfer',
                    authorization: [{
                        actor: from.name,
                        permission: 'active',
                    }],
                    data: {
                        from: from.name,
                        to: newAccount.name,
                        quantity: quantity1,
                        memo: memo
                    }
                },
                {
                    account: tokenContractName,
                    name: 'transfer',
                    authorization: [{
                        actor: from.name,
                        permission: 'active',
                    }],
                    data: {
                        from: from.name,
                        to: newAccount.name,
                        quantity: quantity2,
                        memo: memo
                    }
                }]
        }, {
            blocksBehind: 3,
            expireSeconds: 30,
        });
        console.log(result)
    } catch (e) {
        console.log('\nCaught exception: ' + e);
        if (e instanceof RpcError) {
            console.log(JSON.stringify(e.json, null, 2));
        }
        throw e
    }
}

module.exports = openAccountAndAddCash;