import AddPlantForm from "../../../components/Form/AddPlantForm";

const AddPlant = () => {
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form?.name?.value;
    const category = form?.category?.value;
    const description = form?.description?.value;
    const price = form?.price?.value;
    const quantity = form?.quantity?.value;
    const image = form?.image?.files;
    const plantData = { name, category, description, price, quantity, image };
    console.log(plantData);
  };

  return (
    <div>
      {/* Form */}
      <AddPlantForm handleFormSubmit={handleFormSubmit} />
    </div>
  );
};

export default AddPlant;
