const express = require("express");
const authController = require("./../controllers/authController");
const timeRequestController = require("./../controllers/timeRequestController");

const router = express.Router();

router.route("/").get(timeRequestController.getAllRequests);

//This is used by the UI for the sake of showing how we can download a report.
router
  .route("/report/:userId")
  .get(
    timeRequestController.getRequestReport
  );

  router
  .route("/employee-report/:userId")
  .get(
    authController.protect,
    authController.restrictTo("manager"),
    timeRequestController.getEmployeeRequestReport
  );

router
  .route("/my-report")
  .get(
    authController.protect,
    authController.restrictTo("employee"),
    timeRequestController.getRequestReport
  );

router.use(authController.protect);
router.route("/").post(timeRequestController.createRequest);

router.route("/:id").get(timeRequestController.getRequest);

router.route("/approve/:id").patch(timeRequestController.approveRequest);
router.route("/deny/:id").patch(timeRequestController.denyRequest);

module.exports = router;
