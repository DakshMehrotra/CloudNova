import { Response } from "express";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import File from "../models/File";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";

// UPLOAD FILE
export const uploadFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check storage quota
    if (user.storageUsed + req.file.size > user.storageLimit) {
      // Delete the uploaded file since we're rejecting it
      fs.unlinkSync(req.file.path);
      res.status(400).json({ message: "Storage limit exceeded" });
      return;
    }

    const { folderId } = req.body;

    const file = await File.create({
      name: req.file.originalname,
      originalName: req.file.originalname,
      owner: req.userId,
      folder: folderId || null,
      mimeType: req.file.mimetype,
      size: req.file.size,
      storagePath: req.file.filename, // just the filename, not full path
      uniqueId: uuidv4(),
    });

    // Update user storage
    await User.findByIdAndUpdate(req.userId, {
      $inc: { storageUsed: req.file.size },
    });

    res.status(201).json({ message: "File uploaded", file });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error });
  }
};

// GET FILES (in a folder or root)
export const getFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { folderId } = req.query;

    const files = await File.find({
      owner: req.userId,
      folder: folderId || null,
      isTrashed: false,
    }).sort({ createdAt: -1 });

    res.json({ files });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// DOWNLOAD FILE
export const downloadFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const file = await File.findOne({ _id: req.params.id, owner: req.userId });
    if (!file) {
      res.status(404).json({ message: "File not found" });
      return;
    }

    const filePath = path.join(__dirname, "../../uploads", file.storagePath);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: "File not found on disk" });
      return;
    }

    await File.findByIdAndUpdate(file._id, { $inc: { downloadCount: 1 } });

    res.download(filePath, file.originalName);
  } catch (error) {
    res.status(500).json({ message: "Download failed" });
  }
};

// PREVIEW FILE (stream file to browser)
export const previewFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const file = await File.findOne({ _id: req.params.id, owner: req.userId });
    if (!file) {
      res.status(404).json({ message: "File not found" });
      return;
    }

    const filePath = path.join(__dirname, "../../uploads", file.storagePath);
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Disposition", "inline"); // open in browser, not download
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    res.status(500).json({ message: "Preview failed" });
  }
};

// STAR / UNSTAR FILE
export const toggleStar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const file = await File.findOne({ _id: req.params.id, owner: req.userId });
    if (!file) {
      res.status(404).json({ message: "File not found" });
      return;
    }

    file.isStarred = !file.isStarred;
    await file.save();

    res.json({ message: `File ${file.isStarred ? "starred" : "unstarred"}`, file });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// MOVE TO TRASH
export const trashFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const file = await File.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { isTrashed: true, trashedAt: new Date() },
      { new: true }
    );
    if (!file) {
      res.status(404).json({ message: "File not found" });
      return;
    }
    res.json({ message: "File moved to trash" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// RESTORE FROM TRASH
export const restoreFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const file = await File.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { isTrashed: false, trashedAt: null },
      { new: true }
    );
    if (!file) {
      res.status(404).json({ message: "File not found" });
      return;
    }
    res.json({ message: "File restored", file });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// PERMANENTLY DELETE
export const deleteFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const file = await File.findOne({ _id: req.params.id, owner: req.userId });
    if (!file) {
      res.status(404).json({ message: "File not found" });
      return;
    }

    // Delete from disk
    const filePath = path.join(__dirname, "../../uploads", file.storagePath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    // Update storage
    await User.findByIdAndUpdate(req.userId, {
      $inc: { storageUsed: -file.size },
    });

    await file.deleteOne();
    res.json({ message: "File permanently deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET STARRED FILES
export const getStarredFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const files = await File.find({ owner: req.userId, isStarred: true, isTrashed: false });
    res.json({ files });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET TRASHED FILES
export const getTrashedFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const files = await File.find({ owner: req.userId, isTrashed: true });
    res.json({ files });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// SEARCH FILES
export const searchFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    if (!q) {
      res.status(400).json({ message: "Search query required" });
      return;
    }

    const files = await File.find({
      owner: req.userId,
      isTrashed: false,
      name: { $regex: q as string, $options: "i" }, // case-insensitive search
    });

    res.json({ files });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// RENAME FILE
export const renameFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const file = await File.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { name },
      { new: true }
    );
    if (!file) {
      res.status(404).json({ message: "File not found" });
      return;
    }
    res.json({ message: "File renamed", file });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GENERATE SHARE LINK
export const generateShareLink = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const token = uuidv4();
    const file = await File.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { shareToken: token },
      { new: true }
    );
    if (!file) {
      res.status(404).json({ message: "File not found" });
      return;
    }
    res.json({ shareLink: `http://localhost:5173/share/${token}` });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ACCESS SHARED FILE (public, no auth needed)
export const getSharedFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const file = await File.findOne({ shareToken: req.params.token });
    if (!file) {
      res.status(404).json({ message: "Shared file not found or link expired" });
      return;
    }
    res.json({ file });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
// PUBLIC DOWNLOAD via share token
export const downloadSharedFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const file = await File.findOne({ shareToken: req.params.token });
    if (!file) {
      res.status(404).json({ message: "Shared file not found" });
      return;
    }
    const filePath = path.join(__dirname, "../../uploads", file.storagePath);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: "File not found on disk" });
      return;
    }
    await File.findByIdAndUpdate(file._id, { $inc: { downloadCount: 1 } });
    res.download(filePath, file.originalName);
  } catch (error) {
    res.status(500).json({ message: "Download failed" });
  }
};

// PUBLIC PREVIEW via share token
export const previewSharedFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const file = await File.findOne({ shareToken: req.params.token });
    if (!file) {
      res.status(404).json({ message: "Shared file not found" });
      return;
    }
    const filePath = path.join(__dirname, "../../uploads", file.storagePath);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: "File not found on disk" });
      return;
    }
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Disposition", "inline");
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    res.status(500).json({ message: "Preview failed" });
  }
};

// MOVE FILE TO ANOTHER FOLDER
export const moveFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { targetFolderId } = req.body;
    const file = await File.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { folder: targetFolderId || null },
      { new: true }
    );
    if (!file) {
      res.status(404).json({ message: "File not found" });
      return;
    }
    res.json({ message: "File moved successfully", file });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
