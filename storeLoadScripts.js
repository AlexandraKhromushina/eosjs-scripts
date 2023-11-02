const sendTwoTransfers = require("./sendTwoTransfers.js");
const createOrder = require("./createOrder.js");
const openLqBalance = require("./openLqBalance.js");
const getOrderDetails = require("./getOrderDetails.js");
const swap = require("./swap.js");
const powerUp = require("./powerUp.js");
const assert = require("assert");
const {customAlphabet} = require('nanoid');
const fs = require("fs");
const ecc = require('eosjs-ecc');
const {REDACTEDStoreClient} = require('REDACTEDstore');

describe("Store load scripts", function () {
    this.timeout(175000000000);

    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

    const generate = customAlphabet('12345abcdefghijklmnopqrstuvwxyz', 12)

    let mainAccount = {
        name: 'nnnnnn.REDACTED',
        privateKey: 'REDACTED'
    }
    const client = new REDACTEDStoreClient({
        storeId: 'REDACTED',
        secretKey: 'REDACTED',
    })
    let randomNumber
    let numberOfExistingAccounts
    let numberOfOrders
    let executedOrder
    let json
    let randomAmountToPay
    let actualAmountToPay
    let newOrder
    let tokenName
    let status

    // Проверить уже записанные в файл ордера и удалить те, которые истекли
    // создать все заказы (какая самая большая длительность заказа?) и записать их в файл
    // каждый из них оплатить
    // исключать из списка те, которые были оплачены полностью,
    // сохранять те, которые были оплачены меньшим количеством токенов

    it("Powering up", async () => {
        let data = fs.readFileSync('test/eosAccounts.json', 'utf8')
        let obj = JSON.parse(data)
        numberOfExistingAccounts = obj.accounts.length

        if (!numberOfExistingAccounts) {
            console.log('JSON in corrupted')
            return
        }

        for (let i = 0; i < 100; i++) {
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

        for (let i = 0; i < 100; i++) {
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

        for (let i = 0; i < (200 - numberOfOrders); i++) {
            randomNumber = Math.floor(Math.random() * 100)
            randomAmountToPay = (randomNumber / 10).toFixed(5)

            if (0 <= randomNumber && randomNumber <= 39) {
                tokenName = 'USDCASH'
            } else if (40 <= randomNumber && randomNumber <= 79) {
                tokenName = 'RUBCASH'
            } else if (80 <= randomNumber && randomNumber <= 99) {
                tokenName = 'UAHCASH'
            } else {
                console.log('Какая-то ошибка с генерацией рандомного числа, оно получилось ' + randomNumber);
                break
            }

            newOrder = {
                amount_to_pay: randomAmountToPay,
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

    it("Load ┐('～`;)┌", async () => {
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

        //Проходим по всему файлу с ордерами
        for (let i = 0; i < numberOfOrders; i++) {
            //Создаем случайное число от 0 до 99
            randomNumber = Math.floor(Math.random() * 100)
            console.log(randomNumber)

            //В зависимости от этого числа выбираем, что делать
            if (0 <= randomNumber && randomNumber <= 39) {
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

                    if (executedOrder.status !== 'CREATED') {
                        objOrders.order.splice(i, 1);
                        i--
                    }

                    if (!objOrders.order.length) {
                        break
                    }
                } catch (e) {
                    console.log(e)
                }
            } else if (40 <= randomNumber && randomNumber <= 79) {
                actualAmountToPay = "11.00001"

                try {
                    await swap({
                        quantity: actualAmountToPay + ' ' + objOrders.order[i].currency_name,
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

                    if (executedOrder.status !== 'CREATED') {
                        objOrders.order.splice(i, 1);
                        i--
                    }

                    if (!objOrders.order.length) {
                        break
                    }
                } catch (e) {
                    console.log(e)
                }
            } else if (80 <= randomNumber && randomNumber <= 89) {
                actualAmountToPay = "0.00002"

                try {
                    await swap({
                        quantity: actualAmountToPay + ' ' + objOrders.order[i].currency_name,
                        from: objAccounts.accounts[randomNumber],
                        swapSCName: '141111.REDACTED',
                        memo: 'order_id:  ' + objOrders.order[i].id
                    })

                    await wait(500)

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

                    if (executedOrder.status !== 'CREATED') {
                        objOrders.order.splice(i, 1);
                        i--
                    }

                    if (!objOrders.order.length) {
                        break
                    }
                } catch (e) {
                    console.log(e)
                }
            } else if (90 <= randomNumber && randomNumber <= 99) {
                switch (objOrders.order[i].currency_name) {
                    case 'USDCASH' || 'UAHCASH':
                        tokenName = 'RUBCASH';
                        break;
                    case 'RUBCASH':
                        tokenName = 'USDCASH';
                        break;
                }

                try {
                    await swap({
                        quantity: objOrders.order[i].amount_to_pay + ' ' + tokenName,
                        from: objAccounts.accounts[randomNumber],
                        swapSCName: '141111.REDACTED',
                        memo: 'order_id:  ' + objOrders.order[i].id
                    })
                } catch (e) {
                    console.log(e)
                }
            } else {
                console.log('Какая-то ошибка с генерацией рандомного числа, оно получилось ' + randomNumber);
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

        if (!objExecutedOrders) {
            console.log('JSON in corrupted')
            return
        }

        json = JSON.stringify(objExecutedOrders); //convert it back to json
        await fs.writeFile('test/results/executedOrders.json', json, function () {
        });
    })
})