import { ReactNode } from "react";

interface ButtonHomeBackProps {
  onClick: () => void;
  children: ReactNode;
}
/// <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-md items-center justify-center  flex text-black" ><div className="justify-self-center"><ArrowLeft size={25} /></div></button>
export const ButtonHomeBack = ({ onClick, children }: ButtonHomeBackProps) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className="flex items-center justify-center w-14 h-14 bg-white border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px]"
      aria-label="Voltar para página anterior"
    >
      <div className="justify-self-center">{children}</div>
    </button>
  );
};
