import React, { useState, useEffect } from "react";
import Application from "./Application";
import { LoaderComponent } from "./Components/Common";

function App() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);
  return <>{loading === false ? <Application /> : <LoaderComponent />}</>;
}

export default App;
