import React, { useState, useEffect, useRef } from "react";
import { PublicRoutes } from "./Routes";
import { Provider } from "react-redux";
import store from "./Components/features/store";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { Toaster } from "react-hot-toast";
import { EVENT } from "./services/constants/common";
import log from "./services/logging/logger";
import { keepEyeOnInternetStatus } from "./services/utils";

let persistor = persistStore(store);

const Application = () => {
  const [connect2net, setConnected2net] = useState(!0);

  const lock = useRef(!0);

  useEffect(_ => {
    if(lock.current) {
      keepEyeOnInternetStatus();
      lock.current = !1;
    }
  }, []);

  window.addEventListener(EVENT.NET_STATUS, e => {
    log.w('internet status changes to :', e.detail);
    // here change state variable connect2net
  });

  return (
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <PublicRoutes />
          <Toaster />
        </PersistGate>
      </Provider>
    </>
  );
};

export default Application;
