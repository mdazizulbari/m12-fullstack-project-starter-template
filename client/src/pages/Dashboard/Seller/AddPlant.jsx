import axios from "axios";
import AddPlantForm from "../../../components/Form/AddPlantForm";
import { imageUpload } from "../../../api/utils";
import useAuth from "../../../hooks/useAuth";
import { useState } from "react";
import toast from "react-hot-toast";

const AddPlant = () => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState();
  const [imageUploadError, setImageUploadError] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    const form = e.target;
    const name = form?.name?.value;
    const category = form?.category?.value;
    const description = form?.description?.value;
    const price = form?.price?.value;
    const quantity = form?.quantity?.value;

    try {
      const plantData = {
        name,
        category,
        description,
        price,
        quantity,
        image: uploadedImage,
        seller: {
          name: user?.displayName,
          email: user?.email,
          image: user?.photoURL,
        },
      };
      // console.table(plantData);
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/add-plant`,
        plantData
      );
      console.table(data);
      toast.success("Plant data added successfully");
      form.reset();
    } catch (err) {
      console.log(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    const image = e.target.files[0];
    console.log(image);
    try {
      // image url response from imgbb
      const imageUrl = await imageUpload(image);
      console.log(imageUrl);
      setUploadedImage(imageUrl);
    } catch (err) {
      setImageUploadError("Image Upload Failed");
      console.log(err);
    }
  };

  return (
    <div>
      {/* Form */}
      <AddPlantForm
        isUploading={isUploading}
        handleFormSubmit={handleFormSubmit}
        uploadedImage={uploadedImage}
        handleImageUpload={handleImageUpload}
        imageUploadError={imageUploadError}
      />
    </div>
  );
};

export default AddPlant;
