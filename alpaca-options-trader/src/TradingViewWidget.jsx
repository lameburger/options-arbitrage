import React, { useEffect, useRef, memo, useState } from "react";

function TradingViewWidget() {
  const container = useRef();
  const [symbol, setSymbol] = useState("NASDAQ:AAPL"); // Default symbol

  const loadWidget = () => {
    if (container.current.querySelector("script")) {
      container.current.innerHTML = ""; // Clear the container before reloading
    }

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "width": "100%",
        "height": "100%",
        "symbol": "${symbol}",
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
  };

  useEffect(() => {
    loadWidget();
  }, [symbol]); // Re-run whenever the symbol changes

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Enter stock symbol (e.g., NASDAQ:GOOGL)"
          style={{
            padding: "10px",
            fontSize: "16px",
            borderRadius: "5px",
            border: "1px solid #499167",
            marginRight: "10px",
            width: "300px",
          }}
        />
        <button
          onClick={loadWidget}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "5px",
            backgroundColor: "#499167",
            color: "#ffffff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Update Chart
        </button>
      </div>
      <div
        className="tradingview-widget-container"
        ref={container}
        style={{
          borderRadius: "15px",
          border: "2px solid #499167",
          overflow: "hidden",
          width: "550px",
          height: "399px",
          padding: 0,
          margin: "0 auto", // Center the widget
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
    </div>
  );
}

export default memo(TradingViewWidget);