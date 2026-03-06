import express from "express";
import { 
  submitComplaint, 
  trackComplaint, 
  listComplaints, 
  updateComplaint, 
  deleteComplaint, 
  addResponse 
} from "../controllers/complaintController.js";

export const publicComplaintRoutes = express.Router();
publicComplaintRoutes.post("/", submitComplaint);
publicComplaintRoutes.get("/track/:code", trackComplaint);

export const internalComplaintRoutes = express.Router();
internalComplaintRoutes.get("/", listComplaints);
internalComplaintRoutes.patch("/:id", updateComplaint);
internalComplaintRoutes.delete("/:id", deleteComplaint);
internalComplaintRoutes.post("/responses", addResponse);
