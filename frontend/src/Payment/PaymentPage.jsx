import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPaypalPayment } from "../api";

export default function PaymentPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const {
    totalPrice = 0,
    nights = 0,
    pricePerNight = 0,
    address = "",
    city = "",
    country = "",
    orderId = 0,
  } = state || {};


  
  const handleConfirmPayment = async () => {
    try {
      const paymentResponse = await createPaypalPayment(orderId);

      if (paymentResponse && paymentResponse.approval_url) {
        window.location.href = paymentResponse.approval_url;
      } else {
        throw new Error("Payment creation failed");
      }
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment failed. Please try again.");
    }
  };


  return (
    <div className="container mt-4">
      <h2>Confirm and Pay</h2>
      <div className="row">
        {/* 左侧：支付信息表单 */}
        <div className="col-md-6">
        <h5>Address</h5>
          <p>
            {address}, {city}, {country}
          </p>
          <h5>Price detail</h5>
          <p>
            ${pricePerNight} x {nights} night(s) = ${totalPrice}
          </p>
          <h4>Total: ${totalPrice}</h4>
          <button className="btn btn-primary" onClick={handleConfirmPayment}>
            Confirm and Pay
          </button>
        </div>
      </div>
    </div>
  );
}