// const init = require("./init.js");
// const createCashToken = require("./createCash.js");
const openAccountAndAddCash = require("./openAccountAndAddCash.js");
const sendTwoTransfers = require("./sendTwoTransfers.js");
const removeLiquidity = require("./removeLiquidity.js");
const openREDACTEDalance = require("./openREDACTEDalance.js");
const swap = require("./swap.js");
const powerUp = require("./powerUp.js");
const assert = require("assert");
const {customAlphabet} = require('nanoid');
const fs = require("fs");
const ecc = require('eosjs-ecc');

describe("Swap load scripts", function () {
    this.timeout(175000000000);

    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

    const generate = customAlphabet('12345abcdefghijklmnopqrstuvwxyz', 12)

    let mainAccount = {
        name: 'nnnnnn.REDACTED',
        privateKey: 'REDACTED'
    }
    let randomNumber
    let numberOfExistingAccounts
    let json
    let newAccount
    let newAccountName
    let newAccountPrivateKey = ''
    let newAccountPublicKey = ''

    it("Creating accounts", async () => {
        let data = fs.readFileSync('test/eosAccounts.json', 'utf8')
        let obj = JSON.parse(data)
        numberOfExistingAccounts = obj.accounts.length

        for (let i = 0; i < (500 - numberOfExistingAccounts); i++) {
            newAccountName = generate(); //=> "nc4zs1yyg.jx"

            newAccountPrivateKey = await ecc.randomKey()
            newAccountPublicKey = ecc.privateToPublic(newAccountPrivateKey);

            newAccount = {
                name: newAccountName,
                privateKey: newAccountPrivateKey,
                publicKey: newAccountPublicKey
            }
            console.log(newAccount)

            try {
                await openAccountAndAddCash({
                    from: mainAccount, newAccount, quantity1: '1.00000 USDCASH', quantity2: '50.00000 RUBCASH'
                })
                obj.accounts.push(newAccount); //add some data
            } catch (e) {
                console.log(e);
                break
            }
        }

        if (!obj) {
            console.log('JSON in corrupted')
            return
        }

        json = JSON.stringify(obj); //convert it back to json
        await fs.writeFile('test/eosAccounts.json', json, function () {
        });
    })

    it("Powering up", async () => {
        let data = fs.readFileSync('test/eosAccounts.json', 'utf8')
        let obj = JSON.parse(data)
        numberOfExistingAccounts = obj.accounts.length

        if (!numberOfExistingAccounts) {
            console.log('JSON in corrupted')
            return
        }

        for (let i = 0; i < numberOfExistingAccounts; i++) {
            console.log(i)
            await powerUp({
                receiver: obj.accounts[i], from: mainAccount
            })
        }
    })

    it("Sending tokens", async () => {
        let data = fs.readFileSync('test/eosAccounts.json', 'utf8')
        let obj = JSON.parse(data)
        numberOfExistingAccounts = obj.accounts.length

        if (!numberOfExistingAccounts) {
            console.log('JSON in corrupted')
            return
        }

        for (let i = 130; i < numberOfExistingAccounts; i++) {
            console.log(i)
            await sendTwoTransfers({
                swapSCName: obj.accounts[i].name, from: mainAccount, quantity2: '1000.00000 UAHCASH'
            })
        }
    })

    it("Adding liquidity", async () => {
        let data = fs.readFileSync('test/eosAccounts.json', 'utf8')
        let obj = JSON.parse(data)
        numberOfExistingAccounts = obj.accounts.length

        if (!numberOfExistingAccounts) {
            console.log('JSON in corrupted')
            return
        }

        for (let i = 0; i < 1; i++) {
            await openREDACTEDalance({
                from: obj.accounts[i], ramPayer: mainAccount
            })
            await sendTwoTransfers({
                from: obj.accounts[i]
            })
        }
    })

    it("Removing liquidity", async () => {
        let data = fs.readFileSync('test/eosAccounts.json', 'utf8')
        let obj = JSON.parse(data)
        numberOfExistingAccounts = obj.accounts.length

        if (!numberOfExistingAccounts) {
            console.log('JSON in corrupted')
            return
        }

        for (let i = 0; i < numberOfExistingAccounts; i++) {
            await removeLiquidity({
                from: obj.accounts[i]
            })
        }
    })

    it("Cross-swap", async () => {
        await openREDACTEDalance({
            from: mainAccount, ramPayer: mainAccount, token: '8,REDACTED'
        })

        await swap({
            from: mainAccount, quantity: '5138.74997 UAHCASH', memo: 'swap:5-56-73-65-71'
        })
    })

    it("Load ┐('～`;)┌", async () => {
        let data = fs.readFileSync('test/eosAccounts.json', 'utf8')
        let obj = JSON.parse(data)
        numberOfExistingAccounts = obj.accounts.length

        if (!numberOfExistingAccounts) {
            console.log('JSON in corrupted')
            return
        }

        //Сколько циклов нужно сделать
        for (let c = 0; c < 1; c++) {
            //Проходим по всему файлу с аккаунтами
            for (let i = 0; i < numberOfExistingAccounts; i++) {
                //Создаем случайное число от 0 до 99
                randomNumber = Math.floor(Math.random() * 100)
                console.log(randomNumber)

                //В зависимости от этого числа выбираем, что делать
                if (0 <= randomNumber && randomNumber <= 39) {
                    if (randomNumber % 2 === 0) {
                        await swap({
                            from: obj.accounts[i]
                        })
                    } else {
                        await swap({
                            from: obj.accounts[i], quantity: '0.12345 UAHCASH', memo: 'swap:1'
                        })
                    }
                } else if (40 <= randomNumber && randomNumber <= 79) {
                    if (randomNumber % 2 === 0) {
                        await swap({
                            from: obj.accounts[i], quantity: '8.00000 RUBCASH'
                        })
                    } else {
                        await swap({
                            from: obj.accounts[i], quantity: '8.00000 RUBCASH', memo: 'swap:1'
                        })
                    }
                } else if (80 <= randomNumber && randomNumber <= 89) {
                    if (randomNumber % 2 === 0) {
                        await swap({
                            from: obj.accounts[i],
                            quantity: '8 REDACTED',
                            tokenContract1: 'REDACTED',
                            memo: 'transfer',
                            swapSCName: obj.accounts[i + 1].name
                        })
                    } else {
                        await swap({
                            from: obj.accounts[i],
                            quantity: '9 REDACTED',
                            tokenContract1: 'REDACTED',
                            memo: 'transfer',
                            swapSCName: obj.accounts[i + 1].name
                        })
                    }
                } else if (90 <= randomNumber && randomNumber <= 94) {
                    if (randomNumber % 2 === 0) {
                        await openREDACTEDalance({
                            from: obj.accounts[i], ramPayer: mainAccount
                        })
                        await sendTwoTransfers({
                            from: obj.accounts[i]
                        })
                    } else {
                        await openREDACTEDalance({
                            from: obj.accounts[i], ramPayer: mainAccount, token: '0,REDACTED'
                        })
                        await sendTwoTransfers({
                            from: obj.accounts[i], quantity2: '10.12345 UAHCASH', memo: 'deposit:1'
                        })
                    }
                } else if (95 <= randomNumber && randomNumber <= 99) {
                    await removeLiquidity({
                        from: obj.accounts[i]
                    })
                } else {
                    console.log('Какая-то ошибка с генерацией рандомного числа, оно получилось ' + randomNumber);
                    break
                }

                await wait(500)
            }
        }

        data = fs.readFileSync('test/results/deposits.json', 'utf8')
        let deposits = JSON.parse(data)
        let numberOfDeposits = deposits.deposits.length
        data = fs.readFileSync('test/results/swaps.json', 'utf8')
        let swaps = JSON.parse(data)
        let numberOfSwaps = swaps.swaps.length
        data = fs.readFileSync('test/results/transfers.json', 'utf8')
        let transfers = JSON.parse(data)
        let numberOfTransfers = transfers.transfers.length
        data = fs.readFileSync('test/results/withdraws.json', 'utf8')
        let withdraws = JSON.parse(data)
        let numberOfWithdraws = withdraws.withdraws.length

        console.log('numberOfDeposits: ' + numberOfDeposits)
        console.log('numberOfSwaps: ' + numberOfSwaps)
        console.log('numberOfTransfers: ' + numberOfTransfers)
        console.log('numberOfWithdraws: ' + numberOfWithdraws)
    })
})