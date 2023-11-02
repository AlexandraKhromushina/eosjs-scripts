const  path = require('path');
// Paths to abi, wasm files. It need to deploy Contract
const buildPath = path.resolve(__dirname, '../build/Debug')
const CONTRACT_WASM_PATH = `${buildPath}/eosio.token/eosio.token.wasm`;
const CONTRACT_ABI_PATH = `${buildPath}/eosio.token/eosio.token.abi`;

console.log('CONTRACT_WASM_PATH', CONTRACT_WASM_PATH)

// Initialize framework. By defaul it refs to 'local' network
const eoslime = require("./Swap'REDACTED'.js").eoslime;

const deployedContract = 'eosio.token';

class EosioToken {
    // class methods
    constructor () {
        this.abi
        this.wasm
        this.tokenContract
    }

    async init () {
        this.tokenContract = await eoslime.Contract.deploy(
            CONTRACT_WASM_PATH,
            CONTRACT_ABI_PATH
        );
        await this.tokenContract.makeInline();

        this.contract = this.tokenContract.constructor
    }
}

module.exports = EosioToken;