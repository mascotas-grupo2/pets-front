import React from "react";

const ShowError = ({ message }: { message: string }) => {
  return (
    <div>
      <p className="field-error">{message}</p>
    </div>
  );
};

export default ShowError;
