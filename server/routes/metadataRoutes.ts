import express from "express";
import { 
  getCategories, 
  getTaxCenters, 
  createTaxCenter, 
  updateTaxCenter, 
  deleteTaxCenter, 
  getStats 
} from "../controllers/metadataController.js";

export const adminMetadataRoutes = express.Router();
adminMetadataRoutes.post("/tax-centers", createTaxCenter);
adminMetadataRoutes.patch("/tax-centers/:id", updateTaxCenter);
adminMetadataRoutes.delete("/tax-centers/:id", deleteTaxCenter);

export const publicMetadataRoutes = express.Router();
publicMetadataRoutes.get("/categories", getCategories);
publicMetadataRoutes.get("/tax-centers", getTaxCenters);
publicMetadataRoutes.get("/stats", getStats);
