import Container from "../../components/Shared/Container";
import Heading from "../../components/Shared/Heading";
import Button from "../../components/Shared/Button/Button";
import PurchaseModal from "../../components/Modal/PurchaseModal";
import { useState } from "react";
import { useLoaderData, useParams } from "react-router";
import useAuth from "../../hooks/useAuth";
import useRole from "../../hooks/useRole";
import LoadingSpinner from "../../components/Shared/LoadingSpinner";
import axios from "axios";
import { useEffect } from "react";

const PlantDetails = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [role, isRoleLoading] = useRole();
  // const plant = useLoaderData();

  // fetch plant data without tanStack
  const [plant, setPlant] = useState({});
  const { id } = useParams();
  const fetchPlant = async () => {
    const { data } = await axios(`${import.meta.env.VITE_API_URL}/plant/${id}`);
    setPlant(data);
  };
  useEffect(() => {
    fetchPlant();
  }, [id]);

  const { name, description, category, quantity, price, _id, seller, image } =
    plant || {};

  if (isRoleLoading) return <LoadingSpinner />;
  if (!plant || typeof plant !== "object") return <p>Sorry Bro</p>;

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <Container>
      <div className="mx-auto flex flex-col lg:flex-row justify-between w-full gap-12">
        {/* Header */}
        <div className="flex flex-col gap-6 flex-1">
          <div>
            <div className="w-full overflow-hidden rounded-xl">
              <img
                className="object-cover w-full"
                src={image}
                alt="header image"
              />
            </div>
          </div>
        </div>
        <div className="md:gap-10 flex-1">
          {/* Plant Info */}
          <Heading title={name} subtitle={`Category: ${category}`} />
          <hr className="my-6" />
          <div
            className="
          text-lg font-light text-neutral-500"
          >
            {description}
          </div>
          <hr className="my-6" />

          <div
            className="
                text-xl 
                font-semibold 
                flex 
                flex-row 
                items-center
                gap-2
              "
          >
            <div>Seller: {seller?.name}</div>

            <img
              className="rounded-full"
              height="30"
              width="30"
              alt="Avatar"
              referrerPolicy="no-referrer"
              src={seller?.image}
            />
          </div>
          <hr className="my-6" />
          <div>
            <p
              className="
                gap-4 
                font-light
                text-neutral-500
              "
            >
              Quantity: {quantity} Units Left Only!
            </p>
          </div>
          <hr className="my-6" />
          <div className="flex justify-between">
            <p className="font-bold text-3xl text-gray-500">Price: {price}$</p>
            <div>
              <Button
                disabled={
                  !user || role !== "customer" || user?.email === seller?.email
                }
                onClick={() => setIsOpen(true)}
                label={user ? "Purchase" : "Login to purchase"}
              />
            </div>
          </div>
          <hr className="my-6" />

          <PurchaseModal
            closeModal={closeModal}
            plant={plant}
            isOpen={isOpen}
            user={user}
          />
        </div>
      </div>
    </Container>
  );
};

export default PlantDetails;
