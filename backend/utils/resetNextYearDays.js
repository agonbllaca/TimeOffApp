const nodeCron = require("node-cron");

nodeCron.schedule("3 * * * *", () => {
  console.log("running a task every minute");
});
