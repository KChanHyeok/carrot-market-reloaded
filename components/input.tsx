import { ForwardedRef, forwardRef, InputHTMLAttributes } from "react";

interface inputProps {
  errors?: string[];
  name?: string;
}

const _input = (
  { name, errors = [], ...rest }: inputProps & InputHTMLAttributes<HTMLInputElement>,
  ref: ForwardedRef<HTMLInputElement>
) => {
  return (
    <div className="flex flex-col gap-2">
      <input
        ref={ref}
        name={name}
        className="bg-transparent rounded-md w-full h-10 focus:outline-none 
                    ring-2 focus:ring-4 transition ring-neutral-200 focus:ring-orange-500 
                    border-none placeholder:text-neutral-400"
        {...rest}
      />
      {errors.map((error, index) => (
        <span key={index} className="text-red-500 font-medium">
          {error}
        </span>
      ))}
    </div>
  );
};

export default forwardRef(_input);
