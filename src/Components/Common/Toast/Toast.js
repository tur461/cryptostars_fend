import cogoToast from "cogo-toast";
import './Toast.scss';


class Toaster {
  success = message => {
    let options = { position: "top-right", heading: "Success" };
    cogoToast.success(message, options);
  };

  error = message => {
    let options = { position: "top-right", heading: "Error" };
    cogoToast.error(message, options);
  };

  info = message => {
    let options = { position: "top-right", heading: "Info" };
    cogoToast.info(message, options);
  };

  warn = message => {
    let options = { position: "top-right", heading: "Warning" };
    cogoToast.warn(message, options);
  };

  loading = message => {
    let options = { position: "top-right", heading: "Loading" };
    cogoToast.loading(message, options);
  };
}

export const Toast = new Toaster();
