import React from "react";
import { PublicRoutes } from "./Routes";
import { Provider } from "react-redux";
import store from "./Components/features/store";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { Toaster } from "react-hot-toast";

let persistor = persistStore(store);

const Application = () => {
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
