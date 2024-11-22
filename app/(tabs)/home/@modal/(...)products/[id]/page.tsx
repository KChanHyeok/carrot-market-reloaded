import { PhotoIcon } from "@heroicons/react/24/solid";
import Closebutton from "@/components/close-button";
import db from "@/lib/db";

async function getProduct(id: string) {
  const product = await db.product.findUnique({
    where: {
      id: Number(id),
    },
    select: {
      title: true,
      price: true,
      description: true,
      photo: true,
    },
  });
  return product;
}

export default async function Modal({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  return (
    <div className="absolute w-full h-full bg-black left-0 top-0 z-50 flex justify-center bg-opacity-60 items-center">
      <Closebutton />
      <div className="max-w-screen-sm h-1/2 w-full flex justify-center">
        <div className="flex flex-col lg:flex-row w-full">
          <div
            style={{ backgroundImage: `url(${product?.photo}/public)` }}
            className="aspect-square bg-neutral-700 text-neutral-200 bg-cover
        flex justify-center items-center"
          >
            {product?.photo ? "" : <PhotoIcon className="h-28" />}
          </div>
          <div className="flex flex-col bg-neutral-700 p-5 gap-5">
            <span>{product?.description}</span>
            <span>{product?.price}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
