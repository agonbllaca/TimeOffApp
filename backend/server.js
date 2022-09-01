const mongoose = require("mongoose");
const dotenv = require("dotenv");
const nodeCron = require("node-cron");
const userController = require("./controllers/userController");

//Catching uncaught Exception
process.on("uncaughtException", (err) => {
  console.log("UNHANDLED REJECTION , SHUTTING DOWN ...");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });
const app = require("./app");

// connecting to DB

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("DB Connection Successful!");
  });

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
  nodeCron.schedule("0 0 0 31 12 *", () => {
    console.log("Before cron update");
    userController.resetNextYearDays();
  });
});

//Globaly handling unhandled promisse rejections
//process object will emit the object unhandledRejection
//This is to handle operational problems outside express like mongodb database connection
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION , SHUTTING DOWN ...");
  console.log(err.name, err.message);
  //this is to wait until the server finishes processing the requests then terminate the program
  server.close(
    process.exit(1) // this is used to terminate a programm , 1 is used for errors 0 for no errors
  );
});
