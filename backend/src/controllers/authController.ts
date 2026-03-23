import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

// Generate access token (short-lived: 15 min)
const generateAccessToken = (userId: string) =>
  jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: "15m" });

// Generate refresh token (long-lived: 7 days)
const generateRefreshToken = (userId: string) =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: "7d",
  });

// REGISTER
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ message: "Email already registered" });
      return;
    }

    const user = await User.create({ name, email, password });

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    res.status(201).json({
      message: "Account created successfully",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// LOGIN
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// REFRESH TOKEN
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      res.status(401).json({ message: "No refresh token" });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET as string
    ) as { userId: string };

    const newAccessToken = generateAccessToken(decoded.userId);
    res.json({ accessToken: newAccessToken });
  } catch {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

// GET CURRENT USER
export const getMe = async (req: Request & { userId?: string }, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};