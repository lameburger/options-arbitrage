import React, { useEffect, useRef, memo } from "react";

function TradingViewWidget() {
  const container = useRef();

  useEffect(() => {
    if (container.current.querySelector("script")) return;

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "width": "513",
        "height": "399",
        "symbol": "NASDAQ:AAPL",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "allow_symbol_change": true,
        "calendar": false,
        "support_host": "https://www.tradingview.com"
      }`;
    container.current.appendChild(script);
  }, []);

  return (
    <div
      className="tradingview-widget-container"
      ref={container}
      style={{
        borderRadius: "15px", // Rounded corners
        border: "2px solid #499167", // Border color and thickness
        overflow: "hidden", // Ensures rounded corners apply to inner widget
        width: "550px", // Adjust width as needed
        height: "399px", // Adjust height as needed
        padding: 0,
      }}
    >
      <div
        className="tradingview-widget-container__widget"
        style={{
          width: "100%",
          height: "100%",
        }}
      ></div>
    </div>
  );
}

export default memo(TradingViewWidget);
