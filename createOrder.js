const {REDACTEDStoreClient} = require('REDACTEDstore');

const createOrder = async ({
                               orderParams,
                               client,
                           }) => {

    let createOrderParamsJson = {
        amount_to_pay: orderParams.amount_to_pay,
        currency_name: orderParams.currency_name,
        currency_smart_contract: 'REDACTED',
        response_url: '',
        merchant_order_id: '',
        description: '',
        expiration_time: 99999999, // минуты
        success_payment_redirect_url: '',
        failed_payment_redirect_url: ''
    }

    try {
        const response = await client.createOrder(createOrderParamsJson);

        console.log(response)
        if (response.status === 'OK') {
            // order created
            return response.payload.order.id
        } else {
            // something happened
            throw Error(response.error);
        }
    } catch (e) {
        console.log(e)
        throw e
    }
}

module.exports = createOrder;