import React, { useState, useEffect } from "react";
import Application from "./Application";
import { LoaderComponent } from "./Components/Common";

function App() {
  const [loader, setLoader] = useState(!0);
  
  useEffect(_ => setTimeout(_ => setLoader(!1), 1000), []);
  
  return <> {
    loader ? 
    <LoaderComponent /> : 
    <Application />
  } </>;
}

export default App;
