const server_PORT = 782;
const clientDev_PORT = 780;
const SERVER_URL = `http://localhost:${server_PORT}`;
const CLIENT_URL = `http://localhost:${clientDev_PORT}`;
const appBuild_dir = "app_build";
const clientOut_dirname = "contents";
const clientBuild_dir = `${appBuild_dir}/${clientOut_dirname}`;

module.exports = {
  server_PORT,
  clientDev_PORT,
  SERVER_URL,
  CLIENT_URL,
  appBuild_dir,
  clientOut_dirname,
  clientBuild_dir,
};
