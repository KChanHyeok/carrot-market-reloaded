import { Prisma } from "@prisma/client";
import Addproduct from "../../add/page";
import db from "@/lib/db";

const getProductDetail = async (id: string) => {
  const product = await db.product.findUnique({
    where: {
      id: Number(id),
    },
    select: {
      id: true,
      title: true,
      price: true,
      description: true,
      photo: true,
    },
  });
  return product;
};

export type initialProductDetail = Prisma.PromiseReturnType<typeof getProductDetail>;

export default async function EditProduct({ params }: { params: { id: string } }) {
  const initialProductDetail = await getProductDetail(params.id);
  return (
    <div>
      <Addproduct initialProductDetail={initialProductDetail} />
    </div>
  );
}
