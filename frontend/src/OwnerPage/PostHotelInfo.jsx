import { useState, useEffect } from "react";
import { getAmenities, postHotelInformation, createAmenity } from "../api";
import HotelUploadUpdate from "../assets/Components/HotelUploadUpdate";
export default function PostHotelInfo() {
  return (
    <div className="container mt-4">
      <HotelUploadUpdate isEditMode={false} />
    </div>
  );
}