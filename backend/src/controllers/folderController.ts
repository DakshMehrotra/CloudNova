import { Response } from "express";
import Folder from "../models/Folder";
import { AuthRequest } from "../middleware/auth";

// CREATE FOLDER
export const createFolder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, parentId } = req.body;

    const folder = await Folder.create({
      name,
      owner: req.userId,
      parent: parentId || null,
    });

    res.status(201).json({ message: "Folder created", folder });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET FOLDERS (in a parent or root)
export const getFolders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { parentId } = req.query;

    const folders = await Folder.find({
      owner: req.userId,
      parent: parentId || null,
      isTrashed: false,
    }).sort({ createdAt: -1 });

    res.json({ folders });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// RENAME FOLDER
export const renameFolder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const folder = await Folder.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { name },
      { new: true }
    );
    if (!folder) {
      res.status(404).json({ message: "Folder not found" });
      return;
    }
    res.json({ message: "Folder renamed", folder });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// TRASH FOLDER
export const trashFolder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const folder = await Folder.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { isTrashed: true, trashedAt: new Date() },
      { new: true }
    );
    if (!folder) {
      res.status(404).json({ message: "Folder not found" });
      return;
    }
    res.json({ message: "Folder trashed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// STAR FOLDER
export const toggleStarFolder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, owner: req.userId });
    if (!folder) {
      res.status(404).json({ message: "Folder not found" });
      return;
    }
    folder.isStarred = !folder.isStarred;
    await folder.save();
    res.json({ folder });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};