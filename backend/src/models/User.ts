import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// This defines what a User looks like in the database
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  storageUsed: number;   // bytes used
  storageLimit: number;  // bytes limit (default 1GB)
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    storageUsed: { type: Number, default: 0 },
    storageLimit: { type: Number, default: 1073741824 }, // 1GB in bytes
  },
  { timestamps: true }
);

// ✅ FIXED: removed "next"
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to check password during login
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", UserSchema);