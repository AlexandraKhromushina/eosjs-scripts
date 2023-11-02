const {REDACTEDStoreClient} = require('REDACTEDstore');

const withdrawMoneyFromTheStore = async ({
                               orderParams,
                               client,
                           }) => {

    let withdrawParamsJson = {
        amount: orderParams.amount_to_pay,
        currencyId: orderParams.currency_name,
        eosAccount: 'nnnnnn.REDACTED',
        password: 'REDACTED'
    }

    try {
        const response = await client.withdraw(withdrawParamsJson);

        console.log(response)
        if (response.status === 'OK') {
            // withdraw successful
            console.log(response)
            // return response.payload.order.id
        } else {
            // something happened
            throw Error(response.error);
        }
    } catch (e) {
        console.log(e)
        throw e
    }
}

module.exports = withdrawMoneyFromTheStore;