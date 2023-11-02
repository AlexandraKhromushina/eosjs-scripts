const {REDACTEDStoreClient} = require('REDACTEDstore');

const getOrderDetails = async ({
                                   orderId,
                                   client
                               }) => {
    try {
        const response = await client.getOrder(orderId);

        console.log(response)
        return response.payload.order.status
    } catch (e) {
        console.log(e)
        throw e
    }
}

module.exports = getOrderDetails;