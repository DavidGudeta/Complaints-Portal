import express from "express";
import multer from "multer";
import path from "path";
import { 
  submitComplaint, 
  trackComplaint, 
  listComplaints, 
  updateComplaint, 
  deleteComplaint, 
  addResponse,
  listResponses,
  addAssessment,
  listAssessments,
  submitFeedback,
  addAttachments
} from "../controllers/complaintController.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export const publicComplaintRoutes = express.Router();
publicComplaintRoutes.post("/", upload.array("files", 5), submitComplaint);
publicComplaintRoutes.get("/track/:code", trackComplaint);
publicComplaintRoutes.post("/track/feedback", submitFeedback);
publicComplaintRoutes.post("/track/:code/attachments", upload.array("files", 5), addAttachments);

export const internalComplaintRoutes = express.Router();
internalComplaintRoutes.get("/", listComplaints);
internalComplaintRoutes.patch("/:id", updateComplaint);
internalComplaintRoutes.delete("/:id", deleteComplaint);
internalComplaintRoutes.post("/responses", addResponse);
internalComplaintRoutes.get("/responses", listResponses);
internalComplaintRoutes.post("/assessments", addAssessment);
internalComplaintRoutes.get("/assessments", listAssessments);
