import React from "react";

import { Slider } from "./Slider/Slider";

function App() {
  return (
    <div className="app">
      <h1>Default</h1>
      <div className="container">
        <Slider />
        <Slider value={[20, 80]} />
        <Slider value={[-30, 30]} min={-50} max={50} />
        <Slider value={[-80, -20]} min={-100} max={0} />
        <Slider value={[-180, -120]} min={-200} max={-100} />
      </div>

      <h1>Swap</h1>
      <div className="container">
        <Slider value={[20, 80]} swap />
      </div>

      <h1>Step</h1>
      <div className="container">
        <Slider step={10} swap />
        <Slider value={[20, 80]} step={10} swap />
      </div>

      <h1>Marks</h1>
      <div className="container">
        <Slider step={10} swap marks />
        <Slider step={10} swap marks={[10, 20, 60, 70, 80, 90, 100]} />
      </div>

      <h1>Track</h1>
      <div className="container">
        <Slider step={10} swap marks trackPattern={[true, false]} />
        <Slider step={10} swap marks trackPattern={[false, true]} />
        <Slider
          value={[20, 80]}
          step={10}
          swap
          marks
          trackPattern={[true, false, true]}
        />
        <Slider
          value={[20, 80]}
          step={10}
          swap
          marks
          trackPattern={[false, true, false]}
        />
      </div>

      <h1>Offset</h1>
      <div className="container">
        <Slider step={10} swap marks trackPattern={[true, false]} offset={10} />
      </div>
    </div>
  );
}

export default App;
