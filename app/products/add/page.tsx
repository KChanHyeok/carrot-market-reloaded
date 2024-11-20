"use client";

import { PhotoIcon } from "@heroicons/react/24/solid";
import Input from "../../../components/input";
import Button from "@/components/button";
import { useState } from "react";
import { set } from "zod";
import { getUploadUrl, uploadProduct } from "./action";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductType } from "./schema";
import { error } from "console";

export default function Addproduct() {
  const [preview, setPreview] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
  const [photoId, setImageid] = useState("");
  const [file, setFile] = useState<File | null>();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProductType>({
    resolver: zodResolver(productSchema),
  });

  const onImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { files },
    } = event;
    if (!files) return;
    const file = files[0];
    if (file.type !== "image/jpeg") return;
    if (file.size > 2 * 1024 * 1024) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setFile(file);
    const { success, result } = await getUploadUrl();
    if (success) {
      const { id, uploadURL } = result;
      setUploadUrl(uploadURL);
      setImageid(id);
      setValue("photo", `https://imagedelivery.net/afl0oSwYy5bcInHa7uXGQg/${id}`);
    }
  };
  const onSubmit = handleSubmit(async (data: ProductType) => {
    if (!file) {
      return;
    }
    const cloudflareForm = new FormData();
    cloudflareForm.append("file", file);

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: cloudflareForm,
    });
    if (response.status !== 200) {
      return;
    }
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("price", data.price + "");
    formData.append("description", data.description);
    formData.append("photo", data.photo);
    return uploadProduct(formData);
  });

  const onValid = async () => {
    await onSubmit();
  };

  return (
    <div>
      <form action={onValid} className="flex flex-col gap-5 p-5">
        <label
          htmlFor="photo"
          className="border-2 aspect-square flex items-center flex-col justify-center text-neutral-300 border-neutral-300 rounded-md border-dashed cursor-pointer bg-cover bg-center"
          style={{
            backgroundImage: `url(${preview})`,
          }}
        >
          {preview === "" ? (
            <>
              <PhotoIcon className="w-20" />
              <div className="text-neutral-400 text-sm">사진을 추가해주세요 {errors.photo?.message}</div>
            </>
          ) : null}
        </label>
        <input onChange={onImageChange} type="file" id="photo" accept="image/*" name="photo" className="hidden" />
        <Input required placeholder="제목" type="text" errors={[errors.title?.message ?? ""]} {...register("title")} />
        <Input
          required
          placeholder="가격"
          type="number"
          errors={[errors.price?.message ?? ""]}
          {...register("price")}
        />
        <Input
          required
          placeholder="자세한 설명"
          type="text"
          errors={[errors.description?.message ?? ""]}
          {...register("description")}
        />
        <Button text="작성완료" />
      </form>
    </div>
  );
}
