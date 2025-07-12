import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import "./checkoutForm.css";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";

const CheckoutForm = ({ orderData, closeModal, totalPrice }) => {
  const { user } = useAuth();
  const stripe = useStripe();
  const axiosSecure = useAxiosSecure();
  const elements = useElements();
  const [cardError, setCardError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    const getClientSecret = async () => {
      // server request....
      const { data } = await axiosSecure.post("/create-payment-intent", {
        quantity: orderData?.quantity,
        plantId: orderData?.plantId,
      });
      // console.log(data);
      setClientSecret(data?.clientSecret);
    };
    getClientSecret();
  }, [axiosSecure, orderData]);

  const handleSubmit = async (event) => {
    setProcessing(true);
    // Block native form submission.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    // Get a reference to a mounted CardElement. Elements knows how
    // to find your CardElement because there can only ever be one of
    // each type of element.
    const card = elements.getElement(CardElement);

    if (card == null) {
      return;
    }

    // Use your card Element with other Stripe.js APIs
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card,
    });

    if (error) {
      console.log("[error]", error);
      setCardError(error.message);
      setProcessing(false);
      return;
    } else {
      console.log("[PaymentMethod]", paymentMethod);
      setCardError(null);
    }

    // taka katar pala
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card,
        billing_details: {
          name: user?.displayName,
          email: user?.email,
        },
      },
    });

    if (result?.error) {
      setCardError(result?.error?.message);
    }

    if (result?.paymentIntent?.status === "succeeded") {
      // save orderData in db
      orderData.transactionId = result?.paymentIntent?.id;
      const { data } = axiosSecure.post("/order", orderData);
      console.log(data);
      // update product quantity in db from plant collection
    }
    console.log(result);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: "16px",
              color: "#424770",
              "::placeholder": {
                color: "#aab7c4",
              },
            },
            invalid: {
              color: "#9e2146",
            },
          },
        }}
      />
      {cardError && <p className="text-red-500 mb-6">{cardError}</p>}
      <div className="flex justify-between">
        <button className="btn btn-error" type="button " onClick={closeModal}>
          Cancel
        </button>

        <button
          disabled={!stripe || processing}
          className="btn btn-primary"
          type="submit"
        >
          {processing ? (
            <ClipLoader size={20} className="mt-2" />
          ) : (
            `Pay ${totalPrice}$`
          )}
        </button>
      </div>
    </form>
  );
};

export default CheckoutForm;
