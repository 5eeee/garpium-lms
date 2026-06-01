import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Corporate LMS",
    short_name: "LMS",
    description: "Корпоративное обучение HTML и CSS",
    start_url: "/login",
    display: "standalone",
    background_color: "#2c2c2c",
    theme_color: "#0080ff",
    icons: [
      {
        src: "/CSS.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}
