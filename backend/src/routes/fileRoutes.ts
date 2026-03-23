import { Router } from "express";
import authMiddleware from "../middleware/auth";
import upload from "../middleware/upload";
import {
  uploadFile, getFiles, downloadFile, previewFile,
  toggleStar, trashFile, restoreFile, deleteFile,
  getStarredFiles, getTrashedFiles, searchFiles,
  renameFile, generateShareLink, getSharedFile,
  downloadSharedFile, previewSharedFile, moveFile,
} from "../controllers/fileController";

const router = Router();

// Public routes
router.get("/share/:token", getSharedFile);
router.get("/share/:token/download", downloadSharedFile);
router.get("/share/:token/preview", previewSharedFile);

// Protected routes
router.use(authMiddleware);

router.post("/upload", upload.single("file"), uploadFile);
router.get("/", getFiles);
router.get("/starred", getStarredFiles);
router.get("/trashed", getTrashedFiles);
router.get("/search", searchFiles);
router.get("/:id/download", downloadFile);
router.get("/:id/preview", previewFile);
router.patch("/:id/star", toggleStar);
router.patch("/:id/trash", trashFile);
router.patch("/:id/restore", restoreFile);
router.patch("/:id/rename", renameFile);
router.patch("/:id/move", moveFile);
router.delete("/:id", deleteFile);
router.post("/:id/share", generateShareLink);

export default router;
