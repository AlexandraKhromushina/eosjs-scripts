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
const {REDACTEDClient} = reqire('REDACTED');

describe("Swap load scripts", function () {
    this.timeout(175000000000);

    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

    const generate = customAlphabet('12345abcdefghijklmnopqrstuvwxyz', 12)

    let mainAccount = {
        name: 'nnnnnn.REDACTED',
        privateKey: 'REDACTED'
    }
    const client = new REDACTEDClient({
        storeId: 'REDACTED',
        secretKey: 'REDACTED',
    })
    let randomNumber
    let numberOfExistingAccounts
    let orderParams
    let randomAmountToPay
    let newAccountName
    let newAccountPrivateKey = ''
    let newAccountPublicKey = ''

    // создать все заказы и записать их в файл
    // каждый из них оплатить REDACTED
    // исключать из списка те, которые были оплачены полностью,
    // сохранять те, которые были оплачены меньшим количеством токенов

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
            randomAmountToPay = (Math.floor(Math.random() * 100))/10
            orderParams = { amount_to_pay=randomAmountToPay,
                currency_name='USDCASH',
                currency_smart_contract='REDACTED',
                response_url='',
                merchant_order_id='',
                description='',
                expiration_time=200, // минуты
                success_payment_redirect_url='',
                failed_payment_redirect_url='' }

            try {
                const response = await client.createOrder(orderParams);

                if (response.status === 'OK') {
                    // order created
                    const orderId = response.payload.order;
                } else {
                    // something happend
                    throw Error(response.error);
                }
            } catch (e) {
                console.log(e)
            }

            // ЗАПИСЫВАЕМ НОМЕРА ОРДЕРОВ В ФАЙЛ

            //Проходим по всему файлу с аккаунтами
            for (let i = 0; i < numberOfExistingAccounts; i++) {
                //Создаем случайное число от 0 до 99
                randomNumber = Math.floor(Math.random() * 100)
                console.log(randomNumber)

                // КЕЙСЫ:
                // меньше количество (делаем вторую попытку), ровно количество, больше количество
                // правильный токен, неправильный токен

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