import { useState, useEffect } from "react";
import { getAmenities, postHotelInformation } from "../api";

export default function PostHotelInfo() {
  // List of amenities
  const [amenitiesList, setAmenitiesList] = useState([]);
  // State to store form data
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    price_per_night: "",
    total_rooms: "",
    total_beds: "",
    total_bathrooms: "",
    amenities: [], // Store selected amenities' IDs
    description: "",
    image: null,
  });

  const [uploading, setUploading] = useState(false);

  // **Fetch amenities list**
  useEffect(() => {
    async function fetchAmenities() {
      try {
        const data = await getAmenities();
        setAmenitiesList(data); // Save the list of amenities
      } catch (error) {
        console.error("Error fetching amenities:", error);
      }
    }
    fetchAmenities();
  }, []);

  // **Handle input change**
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  // **Handle checkbox change (for amenities selection)**
  const handleCheckboxChange = (id) => {
    setFormData((prev) => {
      const updatedAmenities = prev.amenities.includes(id)
        ? prev.amenities.filter((amenityId) => amenityId !== id) // Deselect
        : [...prev.amenities, id]; // Select
      return { ...prev, amenities: updatedAmenities };
    });
  };

  // **Submit form**
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Create FormData to handle form fields and files
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("address", formData.address);
      submitData.append("price_per_night", parseFloat(formData.price_per_night));
      submitData.append("total_rooms", parseInt(formData.total_rooms, 10));
      submitData.append("total_beds", parseInt(formData.total_beds, 10));
      submitData.append("total_bathrooms", parseInt(formData.total_bathrooms, 10));
      submitData.append("description", formData.description);

      // Add selected amenities
      formData.amenities.forEach((amenity) => {
        submitData.append("amenities[]", amenity);
      });

      // Add the uploaded image to FormData
      if (formData.image) {
        submitData.append("image", formData.image);
      }

      // Submit data to the API
      const response = await postHotelInformation(submitData);
      console.log("Hotel uploaded:", response);
      alert("Upload successful!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    }

    setUploading(false);
  };

  return (
    <div className="container mt-4">
      <h2>Upload a New Property</h2>
      <form onSubmit={handleSubmit}>
        {/* Hotel name input */}
        <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-control mb-2" placeholder="The name of hotel" required />
        
        {/* Address input */}
        <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="form-control mb-2" placeholder="Address" required />
        
        {/* Price per night input */}
        <input type="number" name="price_per_night" value={formData.price_per_night} onChange={handleInputChange} className="form-control mb-2" placeholder="Price per night" required />
        
        {/* Total rooms input */}
        <input type="number" name="total_rooms" value={formData.total_rooms} onChange={handleInputChange} className="form-control mb-2" placeholder="Number of rooms" required />
        
        {/* Total beds input */}
        <input type="number" name="total_beds" value={formData.total_beds} onChange={handleInputChange} className="form-control mb-2" placeholder="Number of beds" required />
        
        {/* Total bathrooms input */}
        <input type="number" name="total_bathrooms" value={formData.total_bathrooms} onChange={handleInputChange} className="form-control mb-2" placeholder="Number of bathrooms" required />

        {/* Amenities selection (Checkbox) */}
        <label className="form-label">Amenities</label>
        <div className="mb-2">
          {amenitiesList.length > 0 ? (
            amenitiesList.map((amenity) => (
              <div key={amenity.id} className="form-check">
                <input
                    type="checkbox"
                    id={`amenity-${amenity.id}`}
                    className="form-check-input"
                    checked={formData.amenities.includes(amenity.name)}
                    onChange={() => handleCheckboxChange(amenity.name)}
                />
                <label htmlFor={`amenity-${amenity.id}`} className="form-check-label">
                  {amenity.name}
                </label>
              </div>
            ))
          ) : (
            <p>Loading amenities...</p>
          )}
        </div>

        {/* Description textarea */}
        <textarea
        name="description"
        value={formData.description}
        onChange={handleInputChange}
        className="form-control mb-2"
        placeholder="Description"
        required
        ></textarea>

        {/* Image upload */}
        <div className="mb-3">
          <label className="form-label">Upload image</label>
          <input type="file" name="image" onChange={handleInputChange} className="form-control" accept="image/*" required />
        </div>

        {/* Submit button */}
        <button type="submit" className="btn btn-primary w-100" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
}