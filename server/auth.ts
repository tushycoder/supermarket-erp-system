import type { Express, RequestHandler } from "express";
import session from "express-session";
import { storage } from "./storage";

export interface AuthenticatedRequest extends Express.Request {
  user?: {
    id: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
  };
}

// Simple session-based authentication
export function setupAuth(app: Express) {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'supermarket-erp-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }));

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // For demo purposes, create a simple admin user
      if (email === "admin@supermarket.com" && password === "admin123") {
        const user = {
          id: "admin-user-1",
          email: "admin@supermarket.com",
          role: "admin",
          firstName: "Admin",
          lastName: "User",
        };

        (req.session as any).user = user;
        res.json({ success: true, user });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true, message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/auth/user", (req, res) => {
    const user = (req.session as any)?.user;
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
}

// Authentication middleware
export const requireAuth: RequestHandler = (req, res, next) => {
  const user = (req.session as any)?.user;
  if (user) {
    (req as AuthenticatedRequest).user = user;
    next();
  } else {
    res.status(401).json({ message: "Authentication required" });
  }
};

// Role-based authorization middleware
export const requireRole = (roles: string[]): RequestHandler => {
  return (req, res, next) => {
    const user = (req as AuthenticatedRequest).user;
    if (user && roles.includes(user.role)) {
      next();
    } else {
      res.status(403).json({ message: "Insufficient permissions" });
    }
  };
};