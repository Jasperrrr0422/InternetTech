import { useState } from "react";


export default function PostHotelInfo() {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    price_per_night: "",
    total_rooms: "",
    total_beds: "",
    total_bathrooms: "",
    amenities: [],
    description: "",
    image: null,
  });

  const [uploading, setUploading] = useState(false);



  return (
    <div className="container mt-4">
      <h2>Upload a New Property</h2>
      <form >
        {/* 酒店信息 */}
        <input type="text" name="name" value={formData.name} className="form-control mb-2" placeholder="The name of hotel" required />
        <input type="text" name="address" value={formData.address}  className="form-control mb-2" placeholder="Address" required />
        <input type="number" name="price_per_night" value={formData.price_per_night} className="form-control mb-2" placeholder="Price per night" required />
        <input type="number" name="total_rooms" value={formData.total_rooms}  className="form-control mb-2" placeholder="Number of rooms" required />
        <input type="number" name="total_beds" value={formData.total_beds}  className="form-control mb-2" placeholder="Number of beds" required />
        <input type="number" name="total_bathrooms" value={formData.total_bathrooms}  className="form-control mb-2" placeholder="Number of bathrooms" required />

        {/* 设施选择 */}
        <select multiple name="amenities"  className="form-select mb-2">
          <option value="WiFi">WiFi</option>
          <option value="Swimming Pool">Swimming Pool</option>
          <option value="Gym">Gym</option>
          <option value="Parking">Parking</option>
        </select>

        {/* 描述信息 */}
        <textarea name="description" value={formData.description}  className="form-control mb-2" placeholder="Descriptions"></textarea>

        {/* 图片上传 */}
        <div className="mb-3">
          <label className="form-label">Upload image</label>
          <input type="file" name="image"  className="form-control" accept="image/*" required />
        </div>

        {/* 提交按钮 */}
        <button type="submit" className="btn btn-primary w-100" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
}