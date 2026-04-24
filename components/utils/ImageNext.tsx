import Image, { ImageProps } from "next/image";
import React from "react";

const ImageNext = (props: ImageProps) => {
  const { src, alt, className, sizes, style, ...rest } = props;

  if (!src) return null;

  return (
    <div
      className="image-next-container"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Image
        {...rest}
        src={src}
        alt={alt || ""}
        fill
        sizes={
          sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        }
        className={className}
        style={{
          objectFit: "cover",
          ...(style as React.CSSProperties),
        }}
      />
    </div>
  );
};

export default ImageNext;
