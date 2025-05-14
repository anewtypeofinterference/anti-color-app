"use client";

import React, { useState } from "react";
import ColorSwatchSteps from "./ColorSwatchSteps";

const BaseColorPicker = ({ index, color, handleColorChange, handleRemove }) => {
  const { c, m, y, k, stepDirection, varyChannel, numPlusSteps, numMinusSteps, stepInterval, name } = color;
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="bg-white p-6 rounded-md shadow-md border border-gray-200 space-y-6">
      <div className="flex justify-between items-center">
        <input
          type="text"
          value={name}
          onChange={(e) => handleColorChange(index, "name", e.target.value)}
          className="p-2 border border-gray-300 rounded-md w-2/3"
        />
        <button
          onClick={() => setShowSettings(true)}
          className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
        >
          Edit Settings
        </button>
      </div>
      <ColorSwatchSteps
        c={c}
        m={m}
        y={y}
        k={k}
        direction={stepDirection}
        varyChannel={varyChannel}
        numPlusSteps={numPlusSteps}
        numMinusSteps={numMinusSteps}
        stepInterval={stepInterval}
      />
      {handleRemove && (
        <button
          onClick={handleRemove}
          className="bg-red-500 text-white px-4 py-2 rounded-md mt-4"
        >
          Remove Color
        </button>
      )}
      {showSettings && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            {/* Input Fields for Color Settings */}
            <div className="space-y-4">
              {["c", "m", "y", "k"].map((channel) => (
                <label key={channel} className="block">
                  <span className="text-sm capitalize">{channel.toUpperCase()}:</span>
                  <input
                    type="number"
                    name={channel}
                    value={color[channel]}
                    onChange={(e) => handleColorChange(index, channel, Number(e.target.value))}
                    min="0"
                    max="100"
                    className="w-full p-2 mt-1 border border-gray-300 rounded-md"
                  />
                </label>
              ))}
              <label className="block">
                <span className="text-sm">Step Direction:</span>
                <select
                  value={stepDirection}
                  onChange={(e) => handleColorChange(index, "stepDirection", e.target.value)}
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md"
                >
                  <option value="plus">Plus (+)</option>
                  <option value="minus">Minus (-)</option>
                  <option value="both">Both</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm">Vary Channel:</span>
                <select
                  value={varyChannel}
                  onChange={(e) => handleColorChange(index, "varyChannel", e.target.value)}
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md"
                >
                  {["c", "m", "y", "k"].map((channel) => (
                    <option key={channel} value={channel}>
                      {channel.toUpperCase()}
                    </option>
                  ))}
                </select>
              </label>
              <button
                onClick={() => setShowSettings(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md mt-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BaseColorPicker;