import cogoToast from "cogo-toast";
import './Toast.scss';


class Toaster {
  success = (message, op={}) => {
    console.log('op', op);
    let options = { position: op.position || "top-right", heading: "Success" };
    cogoToast.success(message, options);
  };

  error = (message, op={}) => {
    let options = { position: op.position || "top-right", heading: "Error" };
    cogoToast.error(message, options);
  };

  info = (message, op={}) => {
    let options = { position: op.position || "top-right", heading: "Info" };
    cogoToast.info(message, options);
  };

  warn = (message, op={}) => {
    let options = { position: op.position || "top-right", heading: "Warning" };
    cogoToast.warn(message, options);
  };

  loading = (message, op={}) => {
    let options = { position: op.position || "top-right", heading: "Loading" };
    cogoToast.loading(message, options);
  };
}

export const Toast = new Toaster();
