import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  className?: string;
}

export const Card = ({ hover = false, className, children, ...props }: CardProps) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm ${
        hover ? "hover:shadow-lg transition-shadow duration-300" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
