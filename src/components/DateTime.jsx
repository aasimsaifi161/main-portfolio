import React, { useState, useEffect } from "react";

const DateTime = () => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex-1">
      <p className="text-center text-gray-300 font-mono">
        {dateTime.toLocaleString()}
      </p>
    </div>
  );
};

export default DateTime;
