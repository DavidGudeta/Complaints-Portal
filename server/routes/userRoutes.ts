import express from "express";
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  updateProfile, 
  changePassword 
} from "../controllers/userController.js";

export const adminUserRoutes = express.Router();
adminUserRoutes.get("/", getUsers);
adminUserRoutes.post("/", createUser);
adminUserRoutes.patch("/:id", updateUser);
adminUserRoutes.delete("/:id", deleteUser);

export const profileRoutes = express.Router();
profileRoutes.patch("/:id", updateProfile);
profileRoutes.patch("/:id/password", changePassword);
