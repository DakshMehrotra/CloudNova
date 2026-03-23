import { Router } from "express";
import authMiddleware from "../middleware/auth";
import {
  createFolder, getFolders, renameFolder,
  trashFolder, toggleStarFolder,
} from "../controllers/folderController";

const router = Router();

router.use(authMiddleware);

router.post("/", createFolder);
router.get("/", getFolders);
router.patch("/:id/rename", renameFolder);
router.patch("/:id/trash", trashFolder);
router.patch("/:id/star", toggleStarFolder);

export default router;
