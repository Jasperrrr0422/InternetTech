import { useState, useEffect } from "react";
import { getAmenities, postHotelInformation, createAmenity,updateHotelInformation, getHotelDetail } from "../../api";
import { useParams, useNavigate } from "react-router-dom";
export default function HotelUploadUpdate({isEditMode = false}) {
  const { id: hotelId } = useParams();
  const navigate = useNavigate();
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
    image_url: "",  // 添加这个字段存储图片URL
  });
  const [newAmenity, setNewAmenity] = useState({ name: "", description: "" });
  const [amentities, setAmentities] = useState([]); // List of amenities
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);  // 添加加载状态

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
  }, [hotelId, isEditMode]);

  // 加载酒店原有信息
  useEffect(() => {
    if (isEditMode && hotelId) {
      async function fetchHotelData() {
        try {
          const hotelData = await getHotelDetail(hotelId);
          setFormData({
            name: hotelData.name,
            address: hotelData.address,
            price_per_night: hotelData.price_per_night,
            total_rooms: hotelData.total_rooms,
            total_beds: hotelData.total_beds,
            total_bathrooms: hotelData.total_bathrooms,
            description: hotelData.description,
            image: null,
            image_url: hotelData.image_url  // 设置图片URL
          });
          
          // 设置已选择的设施
          const existingAmenities = hotelData.amentities_detail.map(a => a.name);
          setAmentities(existingAmenities);
        } catch (error) {
          console.error("Error fetching hotel data:", error);
          alert("Failed to load hotel information");
        } finally {
          setLoading(false);
        }
      }
      fetchHotelData();
    }
  }, [isEditMode, hotelId]);

  // **Handle input change**
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  // **Handle checkbox change (for amenities selection)**
  const handleCheckboxChange = (name) => {
    setAmentities((prev) => {
        const updatedAmentities = prev.includes(name)
            ? prev.filter((amentityName) => amentityName !== name) 
            : [...prev, name]; 
        
        setFormData((prevForm) => ({
            ...prevForm,
            amentities: updatedAmentities, 
        }));

        return updatedAmentities;
    });
};
  const handleCreateAmenity = async () => {
    if (!newAmenity.name || !newAmenity.description) {
      alert("Please fill in all fields.");
      return;
    }
  
    try {
      const response = await createAmenity(newAmenity.name, newAmenity.description);
      
      alert(`Amenity "${newAmenity.name}" created successfully!`);
      
      // Update the amenities list immediately
      setAmenitiesList((prevAmenities) => [...prevAmenities, response]);
  
      setNewAmenity({ name: "", description: "" }); // Reset form
    } catch (error) {
      console.error("Failed to create amenity:", error);
      alert("Failed to create amenity. Please try again.");
    }
  };
  // **Submit form**
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
        const submitData = new FormData();
        submitData.append("name", formData.name);
        submitData.append("address", formData.address);
        submitData.append("price_per_night", parseFloat(formData.price_per_night));
        submitData.append("total_rooms", parseInt(formData.total_rooms, 10));
        submitData.append("total_beds", parseInt(formData.total_beds, 10));
        submitData.append("total_bathrooms", parseInt(formData.total_bathrooms, 10));
        submitData.append("description", formData.description);

        // ✅ 传 amentities
        // amentities.forEach(amentity => submitData.append("amentities[]", amentity));
        submitData.append("amentities", amentities.join(','));


        if (formData.image) {
            submitData.append("image", formData.image);
        }

        if (isEditMode) {
            await updateHotelInformation(hotelId, submitData);
            alert("Hotel updated successfully!");
            navigate(0);
        } else {
            await postHotelInformation(submitData);
            alert("Hotel created successfully!");
            navigate('/hotels');
        }
    } catch (error) {
        console.error("Error submitting form:", error);
        alert("Operation failed. Please try again.");
    }

    setUploading(false);
};

  // 在返回的 JSX 中添加加载状态判断
  if (isEditMode && loading) {
    return <div>Loading hotel information...</div>;
  }

  return (
    <div className="container mt-4">
      <h2>{isEditMode ? "Edit Hotel" : "Upload a New Property"}</h2>
      <form onSubmit={handleSubmit}>
        {/* Hotel name input */}
        <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-control mb-2" placeholder="The name of hotel"  />

        {/* Address input */}
        <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="form-control mb-2" placeholder="Address"  />

        {/* Price per night input */}
        <input type="number" name="price_per_night" value={formData.price_per_night} onChange={handleInputChange} className="form-control mb-2" placeholder="Price per night"  />

        {/* Total rooms input */}
        <input type="number" name="total_rooms" value={formData.total_rooms} onChange={handleInputChange} className="form-control mb-2" placeholder="Number of rooms"  />

        {/* Total beds input */}
        <input type="number" name="total_beds" value={formData.total_beds} onChange={handleInputChange} className="form-control mb-2" placeholder="Number of beds"  />

        {/* Total bathrooms input */}
        <input type="number" name="total_bathrooms" value={formData.total_bathrooms} onChange={handleInputChange} className="form-control mb-2" placeholder="Number of bathrooms"  />

        {/* Amenities selection (Checkbox) */}
        <label className="form-label">Amenities</label>
        <div className="mb-2">
          {amenitiesList.length > 0 ? (
            amenitiesList.map((amenity) => (
              <div key={amenity.id} className="form-check">
                <input
                  type="checkbox"
                  id={`amenity-${amenity.name}`}
                  className="form-check-input"
                  checked={amentities.includes(amenity.name)}
                  onChange={() => handleCheckboxChange(amenity.name)}
                />
                <label htmlFor={`amenity-${amenity.name}`} className="form-check-label">
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
          
        ></textarea>
        {/* Create New Amenity Section */}
        <div className="mb-3">
          <h4>Create a New Amenity</h4>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Amenity Name"
            value={newAmenity.name}
            onChange={(e) => setNewAmenity({ ...newAmenity, name: e.target.value })}
          />
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Amenity Description"
            value={newAmenity.description}
            onChange={(e) => setNewAmenity({ ...newAmenity, description: e.target.value })}
          />
          <button className="btn btn-primary" onClick={handleCreateAmenity}>
            Submit
          </button>
        </div>


        {/* Image upload */}
        <div className="mb-3">
          <label className="form-label">Image</label>
          {formData.image_url && (
            <div className="mb-2">
              <img 
                src={formData.image_url} 
                alt="Current hotel image" 
                style={{ maxWidth: '200px' }} 
                className="mb-2"
              />
              <p>Current image</p>
            </div>
          )}
          <input 
            type="file" 
            name="image" 
            onChange={handleInputChange} 
            className="form-control" 
            accept="image/*" 
          />
          <small className="text-muted">
            {formData.image_url ? "Upload a new image to replace the current one" : "Upload an image"}
          </small>
        </div>

        {/* Submit button */}
        <button type="submit" className="btn btn-primary w-100" disabled={uploading}>
          {uploading ? "Processing..." : isEditMode ? "Update Hotel" : "Create Hotel"}
        </button>
      </form>
    </div>
  );
}