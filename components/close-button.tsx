"use client";

import { XMarkIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

export default function Closebutton() {
  const router = useRouter();
  const onCloseClick = () => {
    router.back();
  };
  return (
    <button onClick={onCloseClick} className="absolute right-5 top-5 text-neutral-200 cursor-pointer">
      <XMarkIcon className="size-10" />
    </button>
  );
}
