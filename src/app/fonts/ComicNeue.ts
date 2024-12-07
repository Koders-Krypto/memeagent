import localFont from "next/font/local";

const Inter = localFont({
  src: [
    {
      path: "./Comic Neue Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./Comic Neue Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./Comic Neue Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});

export default Inter;
