const  path = require('path');
// Paths to abi, wasm files. It need to deploy Contract
const buildPath = path.resolve(__dirname, '../build/Debug')
const CONTRACT_WASM_PATH = `${buildPath}/list.token/list.token.wasm`;
const CONTRACT_ABI_PATH = `${buildPath}/list.token/list.token.abi`;

console.log('CONTRACT_WASM_PATH', CONTRACT_WASM_PATH)

// Initialize framework. By defaul it refs to 'local' network
const eoslime = require("./SwapREDACTED.js").eoslime;

const deployedContract = 'list.token';

class ListToken {
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

    async setTrust ({trust1, trust2}) {
        await this.tokenContract.settrust(trust1.name, trust2.name)
    }

    async setContest ({trust1, trust2, auc}) {
        await this.tokenContract.setcontest(auc.name, {from: trust1})
        await this.tokenContract.setcontest(auc.name, {from: trust2})
    }

    async setDirector ({trust1, trust2, director}) {
        await this.tokenContract.setdirector(director.name, {from: trust1})
        await this.tokenContract.setdirector(director.name, {from: trust2})
    }
}

module.exports = ListToken;