import express from "express";
import { 
  getCategories, 
  getCategoryTree,
  getSubcategories,
  createCategory,
  updateCategory,
  deleteCategory,
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

adminMetadataRoutes.post("/categories", createCategory);
adminMetadataRoutes.patch("/categories/:id", updateCategory);
adminMetadataRoutes.delete("/categories/:id", deleteCategory);

export const publicMetadataRoutes = express.Router();
publicMetadataRoutes.get("/categories", getCategories);
publicMetadataRoutes.get("/categories/tree", getCategoryTree);
publicMetadataRoutes.get("/subcategories", getSubcategories);
publicMetadataRoutes.get("/tax-centers", getTaxCenters);
publicMetadataRoutes.get("/stats", getStats);
