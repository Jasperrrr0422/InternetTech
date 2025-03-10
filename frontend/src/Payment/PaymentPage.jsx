import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
  } = state || {};


  const [cardNumber, setCardNumber] = useState("");
  const [expiration, setExpiration] = useState("");
  const [cvv, setCvv] = useState("");

  const handleConfirmPayment = () => {
    alert("Payment Confirmed!");
    navigate("/payment-success");
  };

  return (
    <div className="container mt-4">
      <h2>Confirm and Pay</h2>
      <div className="row">
        {/* 左侧：支付信息表单 */}
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Credit or Debit Card</label>
            <input
              type="text"
              className="form-control"
              placeholder="Card Number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
          </div>
          <div className="d-flex gap-2 mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Expiration (MM/YY)"
              value={expiration}
              onChange={(e) => setExpiration(e.target.value)}
            />
            <input
              type="text"
              className="form-control"
              placeholder="CVV"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
            />
          </div>

          {/* 其他支付方式的图标（可自行替换图片路径） */}
          <div className="mb-3">
            <img
              src="/images/paypal.png"
              alt="PayPal"
              width="50"
              className="me-2"
            />
            <img
              src="/images/applepay.png"
              alt="Apple Pay"
              width="50"
              className="me-2"
            />
            <img src="/images/visa.png" alt="Visa" width="50" className="me-2" />
            <img
              src="/images/mastercard.png"
              alt="MasterCard"
              width="50"
              className="me-2"
            />
          </div>

          <button className="btn btn-primary" onClick={handleConfirmPayment}>
            Confirm and Pay
          </button>
        </div>

        {/* 右侧：支付摘要信息 */}
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
        </div>
      </div>
    </div>
  );
}