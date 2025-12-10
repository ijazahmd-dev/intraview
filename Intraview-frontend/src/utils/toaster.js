import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const toaster = {
  success: (msg) => toast.success(msg),
  error: (msg) => toast.error(msg),
};

export default toaster;
