import AddPlantForm from "../../../components/Form/AddPlantForm";

const AddPlant = () => {
  const handleFormSubmit = (e) => {
    e.preventDefault()
    console.log(e.target);
  };

  return (
    <div>
      {/* Form */}
      <AddPlantForm handleFormSubmit={handleFormSubmit} />
    </div>
  );
};

export default AddPlant;
