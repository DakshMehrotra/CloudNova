import mongoose, { Document, Schema } from "mongoose";

export interface IFolder extends Document {
  name: string;
  owner: mongoose.Types.ObjectId;
  parent: mongoose.Types.ObjectId | null; // null = root folder
  path: string;   // e.g. "/Documents/Work"
  isStarred: boolean;
  isTrashed: boolean;
  trashedAt: Date | null;
  createdAt: Date;
}

const FolderSchema = new Schema<IFolder>(
  {
    name: { type: String, required: true, trim: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    parent: { type: Schema.Types.ObjectId, ref: "Folder", default: null },
    path: { type: String, default: "/" },
    isStarred: { type: Boolean, default: false },
    isTrashed: { type: Boolean, default: false },
    trashedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<IFolder>("Folder", FolderSchema);