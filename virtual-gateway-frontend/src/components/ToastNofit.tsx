import React from "react";
import toast, { ToastOptions } from "react-hot-toast";

interface CustomToastProps {
    title: string;
    message: string;
    type?: "success" | "error" | "info" | "warning";
  }
  
  const CustomToastContent: React.FC<CustomToastProps> = ({ title, message, type }) => {
    let alertCss = ""
    let iconTextCss = ""

    switch (type) {
        case "success":
            alertCss = "dark:!bg-green-500 border-green-500"
            iconTextCss = "text-green-500"
            break;
        case "error":
            alertCss = "dark:!bg-red-500 border-red-500"
            iconTextCss = "text-red-500"
            break;
        case "info":
            alertCss = "dark:!bg-blue-500 border-blue-500"
            iconTextCss = "text-blue-500"
            break;
        case "warning":
            alertCss = "dark:!bg-yellow-500 border-yellow-500"
            iconTextCss = "text-yellow-500"
            break;
        default:
            break;
    }

    const typeIcon = {
        success: "fa-light fa-circle-check",
        error: "fa-light fa-circle-xmark",
        info: "fa-light fa-circle-info",
        warning: "fa-light fa-triangle-exclamation",
      };
    return (
        <div className={`alert alert-horizontal shadow-xl !bg-white  border-2 ${alertCss}`}>
            <div className={`mr-3 text-2xl ${iconTextCss} dark:text-white`}>
                <i className={typeIcon[type || "info"]}></i>
            </div>
            <div className="flex flex-col ml-2 dark:text-white">
                <h4 className="font-bold text-base">{title}</h4>
                <p className="text-sm">{message}</p>
            </div>
        </div>
    );
  };

export const showToast = (props: CustomToastProps, options?: ToastOptions) => {
    toast.custom((t) => <CustomToastContent {...props} />, options);
};