import mongoose, { Document, Schema } from "mongoose";

export interface IFile extends Document {
  name: string;
  originalName: string;
  owner: mongoose.Types.ObjectId;
  folder: mongoose.Types.ObjectId | null; // null = root
  mimeType: string;       // e.g. "image/png", "application/pdf"
  size: number;           // in bytes
  storagePath: string;    // where file is saved on disk
  uniqueId: string;       // UUID for sharing
  isStarred: boolean;
  isTrashed: boolean;
  trashedAt: Date | null;
  shareToken: string | null;  // for public sharing
  downloadCount: number;
  createdAt: Date;
}

const FileSchema = new Schema<IFile>(
  {
    name: { type: String, required: true, trim: true },
    originalName: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    folder: { type: Schema.Types.ObjectId, ref: "Folder", default: null },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    storagePath: { type: String, required: true },
    uniqueId: { type: String, required: true, unique: true },
    isStarred: { type: Boolean, default: false },
    isTrashed: { type: Boolean, default: false },
    trashedAt: { type: Date, default: null },
    shareToken: { type: String, default: null },
    downloadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IFile>("File", FileSchema);