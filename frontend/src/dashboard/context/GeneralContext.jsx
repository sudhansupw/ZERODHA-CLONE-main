import React, { useState } from "react";

import ActionWindow from "../components/ActionWindow";

const GeneralContext = React.createContext({
  openWindow: (uid, mode) => {},
  closeWindow: () => {},
});

export const GeneralContextProvider = (props) => {
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [selectedStockUID, setSelectedStockUID] = useState("");
  const [mode, setMode] = useState("BUY");

  const handleOpenWindow = (uid, mode) => {
    setIsWindowOpen(true);
    setSelectedStockUID(uid);
    setMode(mode);
  };

  const handleCloseWindow = () => {
    setIsWindowOpen(false);
    setSelectedStockUID("");
  };

  return (
    <GeneralContext.Provider
      value={{
        mode,
        setMode,
        openWindow: handleOpenWindow,
        closeWindow: handleCloseWindow,
      }}
    >
      {props.children}
      {isWindowOpen && <ActionWindow uid={selectedStockUID} mode={mode} />}
    </GeneralContext.Provider>
  );
};

export default GeneralContext;
