const { clientBuild_dir } = require("../tslib/config");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  assetPrefix: "./",
  distDir: `../${clientBuild_dir}`,
};

module.exports = nextConfig;
