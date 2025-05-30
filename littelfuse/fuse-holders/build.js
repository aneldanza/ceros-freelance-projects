({
  baseUrl: "public", // Output directory of compiled JS files
  name: "main", // Entry point (compiled to main.js by tsc)
  out: "dist/fuse-holders.js",
  paths: {
    CerosSDK: "empty:", // Exclude CerosSDK if loaded externally via RequireJS
  },
  include: [],
  optimize: "none",
});
