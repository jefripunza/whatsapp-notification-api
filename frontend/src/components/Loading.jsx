import React from "react";
import ReactLoading from "react-loading";

const Loading = ({ type, color, size }) => {
  size = size ?? 20;
  return (
    <div className="h-100 center-of-div">
      <ReactLoading
        type={type}
        color={color}
        height={`${size}%`}
        width={`${size}%`}
      />
    </div>
  );
};

export default Loading;
