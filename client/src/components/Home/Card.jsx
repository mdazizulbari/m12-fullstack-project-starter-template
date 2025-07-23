import { Link } from "react-router";

const Card = ({ plant }) => {
  const { name, category, quantity, price, image, _id } = plant || {};
  return (
    <Link
      to={`/plant/${_id}`}
      className="group col-span-1 cursor-pointer rounded-xl p-3 shadow-xl"
    >
      <div className="flex w-full flex-col gap-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-xl">
          <img
            className="h-full w-full object-cover transition group-hover:scale-110"
            src={image}
            alt="Plant Image"
          />
          <div className="absolute top-3 right-3"></div>
        </div>
        <div className="text-lg font-semibold">{name}</div>
        <div className="text-lg font-semibold">Category: {category}</div>
        <div className="text-lg font-semibold">Quantity: {quantity}</div>
        <div className="flex flex-row items-center gap-1">
          <div className="font-semibold"> Price: {price}$</div>
        </div>
      </div>
    </Link>
  );
};

export default Card;
