import { useEffect, useState } from "react";

type ToastProps = {
  message: string;
  type?: "success" | "error";
};
const Toast = ({ message, type = "success" }: ToastProps) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(timer);
  }, [message, type]);

  if (!show) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div
        className={`px-4 py-2 rounded shadow-lg text-white animate-fade-in-out
        ${type === "success" ? "bg-green-600" : "bg-red-600"}`}
        dangerouslySetInnerHTML={{ __html: message }}
      />
    </div>
  );
};

export default Toast;
