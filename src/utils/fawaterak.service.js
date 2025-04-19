import axios from "axios";
export const fetchPaymentMethods = async () => {
    try {
        const response = await axios.get("https://app.fawaterk.com/api/v2/getPaymentmethods", {
            headers: {
                "content-type": "application/json",
                Authorization: "Bearer " + process.env.FAWATERK_API_KEY,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error("Failed to fetch payment methods");
    }
};
export const initiatePayment = async (paymentDetails) => {
    try {
        const { payment_method_id, cartTotal, currency, customer, redirectionUrls, cartItems } = paymentDetails;
        const response = await axios.post(
            "https://app.fawaterk.com/api/v2/invoiceInitPay",
            {
                payment_method_id,
                cartTotal,
                currency,
                customer,
                redirectionUrls,
                cartItems,
            },
            {
                headers: {
                    Authorization: "Bearer " + process.env.FAWATERK_API_KEY,
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error) {
        throw new Error("Failed to execute payment");
    }
};
