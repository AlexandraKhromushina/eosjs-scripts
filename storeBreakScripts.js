const sendTwoTransfers = require("./sendTwoTransfers.js");
const createOrder = require("./createOrder.js");
const withdrawMoneyFromTheStore = require("./withdrawMoneyFromTheStore.js");
const openLqBalance = require("./openLqBalance.js");
const getOrderDetails = require("./getOrderDetails.js");
const swap = require("./swap.js");
const powerUp = require("./powerUp.js");
const assert = require("assert");
const {customAlphabet} = require('nanoid');
const fs = require("fs");
const ecc = require('eosjs-ecc');
const {REDACTEDStoreClient} = require('REDACTEDstore');

describe("Store break scripts", function () {
    this.timeout(175000000000);

    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

    const generate = customAlphabet('12345abcdefghijklmnopqrstuvwxyz', 12)

    let mainAccount = {
        name: 'nnnnnn.REDACTED',
        privateKey: 'REDACTED'
    }
    //somestore test.REDACTED.store l/p: shivathewishmaker@gmail.com/REDACTED
    const client = new REDACTEDStoreClient({
        storeId: 'REDACTED',
        secretKey: 'REDACTED',
    })
    let randomNumber
    let numberOfExistingAccounts
    let numberOfOrders
    let executedOrder
    let json
    let amountToPay
    let actualAmountToPay
    let newOrder
    let tokenName
    let status

    // Проверить уже записанные в файл ордера и удалить те, которые истекли
    // создать один заказ и записать его в файл
    // оплатить заказ
    // попробовать получить несколько рефандов или несколько выводов денег с аккаунта магазина

    it("Powering up", async () => {
        let data = fs.readFileSync('test/eosAccounts.json', 'utf8')
        let obj = JSON.parse(data)
        numberOfExistingAccounts = obj.accounts.length

        if (!numberOfExistingAccounts) {
            console.log('JSON in corrupted')
            return
        }

        for (let i = 0; i < 1; i++) {
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

        for (let i = 0; i < 1; i++) {
            console.log(i)
            await sendTwoTransfers({
                swapSCName: obj.accounts[i].name, from: mainAccount, quantity2: '10.00000 USDCASH'
            })
        }
    })

    // You will require approximately 15 minutes to create 2000 orders
    it("Creating orders", async () => {
        let data = fs.readFileSync('test/orders.json', 'utf8')
        let objOrders = JSON.parse(data)
        numberOfOrders = objOrders.order.length

        for (let i = 0; i < numberOfOrders; i++) {
            try {
                status = await getOrderDetails({
                    orderId: objOrders.order[i].id,
                    client
                })

                if (status !== 'CREATED') {
                    throw new Error
                }
            } catch (e) {
                objOrders.order.splice(i, 1);
                i--
                if (!objOrders.order.length) {
                    break
                }
            }
        }

        // Getting the number of orders left
        numberOfOrders = objOrders.order.length

        for (let i = 0; i < (1 - numberOfOrders); i++) {
            amountToPay = 1.00002
            tokenName = 'USDCASH'

            newOrder = {
                amount_to_pay: amountToPay,
                currency_name: tokenName,
                id: ""
            }
            console.log(newOrder)

            try {
                newOrder.id = await createOrder({
                    orderParams: newOrder, client
                })
                objOrders.order.push(newOrder);
            } catch (e) {
                console.log(e);
                break
            }

            await wait(500)
        }

        if (!objOrders) {
            console.log('JSON in corrupted')
            return
        }

        json = JSON.stringify(objOrders); //convert it back to json
        await fs.writeFile('test/orders.json', json, function () {
        });
    })

    it("REFUND", async () => {
        let data = fs.readFileSync('test/eosAccounts.json', 'utf8')
        let objAccounts = JSON.parse(data)
        numberOfExistingAccounts = objAccounts.accounts.length

        if (!numberOfExistingAccounts) {
            console.log('JSON in corrupted')
            return
        }

        data = fs.readFileSync('test/orders.json', 'utf8')
        let objOrders = JSON.parse(data)
        numberOfOrders = objOrders.order.length

        if (!numberOfOrders) {
            console.log('JSON in corrupted')
            return
        }

        data = fs.readFileSync('test/results/executedOrders.json', 'utf8')
        let objExecutedOrders = JSON.parse(data)

        //Выбираем первый ордер и оплачиваем его
        let i=0
            try {
                await swap({
                    quantity: objOrders.order[i].amount_to_pay + ' ' + objOrders.order[i].currency_name,
                    from: objAccounts.accounts[randomNumber],
                    swapSCName: '141111.REDACTED',
                    memo: 'order_id:  ' + objOrders.order[i].id
                })

                await wait(500)

                executedOrder = {
                    id: objOrders.order[i].id,
                    status: ''
                }

                try {
                    executedOrder.status = await getOrderDetails({
                        orderId: objOrders.order[i].id,
                        client
                    })
                    console.log(executedOrder.status)
                } catch (e) {
                    console.log(e)
                }

                objExecutedOrders.order.push(executedOrder);
            } catch (e) {
                console.log(e)
            }

        await wait(500)

        if (!objExecutedOrders) {
            console.log('JSON in corrupted')
            return
        }

        json = JSON.stringify(objExecutedOrders); //convert it back to json
        await fs.writeFile('test/results/executedOrders.json', json, function () {
        })
    })

    it("WITHDRAW", async () => {
        let data = fs.readFileSync('test/eosAccounts.json', 'utf8')
        let objAccounts = JSON.parse(data)
        numberOfExistingAccounts = objAccounts.accounts.length

        if (!numberOfExistingAccounts) {
            console.log('JSON in corrupted')
            return
        }

        data = fs.readFileSync('test/orders.json', 'utf8')
        let objOrders = JSON.parse(data)
        numberOfOrders = objOrders.order.length

        if (!numberOfOrders) {
            console.log('JSON in corrupted')
            return
        }

        data = fs.readFileSync('test/results/executedOrders.json', 'utf8')
        let objExecutedOrders = JSON.parse(data)

        //Выбираем первый ордер и оплачиваем его
        let i=0
            try {
                await swap({
                    quantity: objOrders.order[i].amount_to_pay + ' ' + objOrders.order[i].currency_name,
                    from: objAccounts.accounts[i],
                    swapSCName: '141111.REDACTED',
                    memo: 'order_id:  ' + objOrders.order[i].id
                })

                await wait(1500)

                executedOrder = {
                    id: objOrders.order[i].id,
                    status: ''
                }

                try {
                    executedOrder.status = await getOrderDetails({
                        orderId: objOrders.order[i].id,
                        client
                    })
                    console.log(executedOrder.status)
                } catch (e) {
                    console.log(e)
                }

                objExecutedOrders.order.push(executedOrder);
            } catch (e) {
                console.log(e)
            }

        await wait(500)

        json = JSON.stringify(objExecutedOrders); //convert it back to json
        await fs.writeFile('test/results/executedOrders.json', json, function () {
        })

        await withdrawMoneyFromTheStore({
            orderParams: objExecutedOrders.order[0], client
        })

        if (!objExecutedOrders) {
            console.log('JSON in corrupted')
            return
        }
    })
})