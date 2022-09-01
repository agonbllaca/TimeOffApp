const express = require("express");
const authController = require("./../controllers/authController");
const userController = require("./../controllers/userController");

const router = express.Router();

router.post("/login", authController.login);
router.post("/admin-signup", authController.createAdmin);

router
  .route("/createManager")
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    authController.createUser
  );

router
  .route("/createEmployee")
  .post(
    authController.protect,
    authController.restrictTo("manager"),
    authController.createUser
  );


router
  .route("/")
  .get(userController.getAllUsers)

router
    .route('/reset-password/:id')
    .patch(
      authController.protect,
      authController.restrictTo('admin'),
      authController.resetPassword)

router
  .route("/:id")
  .get(userController.getUser)
  .patch(authController.protect
    ,authController.restrictTo("admin")
    ,userController.updateUser)
  .delete(
    authController.protect
    ,authController.restrictTo("admin")
    ,userController.deleteUser);

module.exports = router;
