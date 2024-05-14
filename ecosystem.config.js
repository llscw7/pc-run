module.exports = {
  apps : [
    {
      name   : "llscw",
      script : "start.js",
      exec_mode: "cluster",
      watch: ["./src"],
      watch_delay: 1000,
      ignore_watch : ["*/**/*.d.ts"],
    },
    {
      name   : "llscw_view",
      script : "start-view.js",
      exec_mode: "cluster",
      watch: ["./pc-run-view/src"],
      watch_delay: 1000,
      ignore_watch : ["*/**/*.d.ts"],
    },
    {
      name   : "llscw_assets",
      script : "start-assets.js",
      exec_mode: "cluster",
      watch: ["./start-assets.js"],
      watch_delay: 1000,
      // watch: ["./assets_pc"],
      // watch_delay: 1000,
      // ignore_watch : ["*/**/*.js","*/**/*.json"],
    },
  ]
}
