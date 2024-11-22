import db from "@/lib/db";
import { getSession } from "@/lib/session";
import { formatToWon } from "@/lib/utils";
import { UserIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { unstable_cache as nextCache, revalidateTag } from "next/cache";

async function getIsOwner(userId: number) {
  const session = await getSession();
  if (session.id) {
    return session.id === userId;
  }
  return false;
}

async function getProduct(id: number) {
  const product = await db.product.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          username: true,
          avatar: true,
        },
      },
    },
  });
  return product;
}

const getCachedProduct = nextCache(getProduct, ["product-detail"], {
  tags: ["product-detail"],
});

async function getProductTitle(id: number) {
  const product = await db.product.findUnique({
    where: {
      id,
    },
    select: {
      title: true,
    },
  });
  return product;
}

const getCachedProductTitle = nextCache(getProductTitle, ["product-title"], {
  tags: ["product-title"],
});

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await getCachedProductTitle(Number(params.id));
  return {
    title: product?.title,
  };
}

export default async function ProductDetail({ params }: { params: { id: string } }) {
  revalidateTag("product-list");

  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }
  const product = await getCachedProduct(id);
  if (!product) {
    return notFound();
  }
  const isOwner = await getIsOwner(product.userId);

  // const revalidate = async () => {
  //   "use server";
  //   revalidateTag("product-title");
  // };

  const onClickDelete = async () => {
    "use server";
    await db.product.delete({
      where: {
        id,
      },
    });
    revalidateTag("product-detail");
    redirect("/home");
  };

  return (
    <div>
      <div className="relative aspect-square">
        <Image fill className="object-cover" src={`${product.photo}/public`} alt={product.title} />
      </div>
      <div className="p-5 flex items-center gap-3 border-b border-neutral-700">
        <div className="size-10 rounded-full overflow-hidden">
          {product.user.avatar !== null ? (
            <Image src={product.user.avatar} width={40} height={40} alt={product.user.username} />
          ) : (
            <UserIcon />
          )}
        </div>
        <div>
          <h3>{product.user.username}</h3>
        </div>
      </div>
      <div className="p-5">
        <h1 className="text-2xl font-semibold">{product.title}</h1>
        <p>{product.description}</p>
      </div>
      <div className="fixed w-full bottom-0 left-0 p-5 pb-10 bg-neutral-800 flex justify-between items-center">
        <span className="font-semibold text-lg">{formatToWon(product.price)}원</span>
        {isOwner ? (
          <>
            <Link
              className="bg-orange-500 p-5 py-2.5 rounded-md text-white font-semibold"
              href={`/products/${product.id}/edit`}
            >
              수정하기
            </Link>
            <form action={onClickDelete}>
              <button className="bg-red-500 p-5 py-2.5 rounded-md text-white font-semibold">삭제</button>
            </form>
          </>
        ) : null}
        <Link className="bg-orange-500 p-5 py-2.5 rounded-md text-white font-semibold" href={""}>
          채팅하기
        </Link>
      </div>
    </div>
  );
}

export const dynamicParams = true;

export async function generateStaticParams() {
  const products = await db.product.findMany({
    select: {
      id: true,
    },
  });
  return products.map((product) => ({ id: product.id + "" }));
}
