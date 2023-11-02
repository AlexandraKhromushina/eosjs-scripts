const  path = require('path');
// Paths to abi, wasm files. It need to deploy Contract
const buildPath = path.resolve(__dirname, '../build/Debug')
const CONTRACT_WASM_PATH = `${buildPath}/cash.token/cash.token.wasm`;
const CONTRACT_ABI_PATH = `${buildPath}/cash.token/cash.token.abi`;

console.log('CONTRACT_WASM_PATH', CONTRACT_WASM_PATH)

// Initialize framework. By defaul it refs to 'local' network
const eoslime = require("./Swap'REDACTED'.js").eoslime;

const deployedContract = 'REDACTED';

class CashToken {
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

module.exports = CashToken;