import axios from "axios";
import AddPlantForm from "../../../components/Form/AddPlantForm";

const AddPlant = () => {
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form?.name?.value;
    const category = form?.category?.value;
    const description = form?.description?.value;
    const price = form?.price?.value;
    const quantity = form?.quantity?.value;

    // put raw image in formData
    const image = form?.image?.files[0];
    const imageFormData = new FormData();
    imageFormData.append("image", image);
    // console.log(image);

    // upload image in imgbb to get image url
    const { data } = await axios.post(
      `https://api.imgbb.com/1/upload?key=${
        import.meta.env.VITE_IMGBB_API_KEY
      }`,
      imageFormData
    );
    const imageUrl = data?.data?.display_url;
    const plantData = {
      name,
      category,
      description,
      price,
      quantity,
      image: imageUrl,
    };
    console.table(plantData);
  };

  return (
    <div>
      {/* Form */}
      <AddPlantForm handleFormSubmit={handleFormSubmit} />
    </div>
  );
};

export default AddPlant;
