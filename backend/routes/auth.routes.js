import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/User.model.js";
import { Otp } from "../models/Otp.model.js";
import bcrypt from "bcryptjs";
import { createAccessToken, createRefreshToken } from "../utils/token.utils.js";
import twilio from "twilio";
import { verifyToken } from "../middlewares/verifyAuth.middleware.js";

const router = express.Router();

// configure passport Google
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // find or create user
        const email = profile.emails?.[0]?.value;
        let user = await User.findOne({
          provider: "google",
          providerId: profile.id,
        });
        if (!user) {
          user = await User.findOne({ email });
        }
        if (!user) {
          user = await User.create({
            provider: "google",
            providerId: profile.id,
            name: profile.displayName,
            email,
          });
        } else {
          // update provider fields if missing
          user.provider = "google";
          user.providerId = profile.id;
          user.name = user.name || profile.displayName;
          user.email = user.email || email;
          await user.save();
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// GOOGLE auth flow start
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// GOOGLE callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login`,
  }),
  async (req, res) => {
    try {
      const user = req.user;
      const accessToken = createAccessToken(user);
      const refreshToken = createRefreshToken(user);

      // save hashed refresh token to DB for revocation (optional)
      user.refreshTokens.push({
        token: refreshToken,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      await user.save();

      // set HttpOnly refresh cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // redirect to client success page (client should call /auth/me)
      res.redirect(`${process.env.CLIENT_URL}/auth/success`);
    } catch (err) {
      console.error(err);
      res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
    }
  }
);

// PHONE OTP: request OTP
router.post("/phone/request-otp", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // upsert Otp
    await Otp.findOneAndUpdate(
      { phone },
      { otpHash, expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // send via Twilio if configured, else console.log
    if (
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
    ) {
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      await client.messages.create({
        body: `Your verification code is ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });
    } else {
      console.log(`[DEV] OTP for ${phone}: ${otp}`);
    }

    return res.json({
      ok: true,
      message: "OTP sent (dev: check server log if no Twilio configured)",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PHONE OTP: verify
router.post("/phone/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ error: "Missing" });

    const record = await Otp.findOne({ phone });
    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ error: "OTP expired or not found" });
    }

    const valid = await record.verify(otp);
    if (!valid) return res.status(400).json({ error: "Invalid OTP" });

    // find or create user
    let user = await User.findOne({ provider: "phone", providerId: phone });
    if (!user) {
      user = await User.create({ provider: "phone", providerId: phone, phone });
    }

    // remove OTP record
    await Otp.deleteOne({ phone });

    // issue tokens & set refresh cookie
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    user.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// refresh access token
router.post("/refresh", async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ error: "No refresh token" });

    // verify
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (e) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: "User not found" });

    // Optional: verify token exists in user's refreshTokens list
    const found = user.refreshTokens.find((r) => r.token === token);
    if (!found) {
      return res.status(401).json({ error: "Refresh token revoked" });
    }

    const accessToken = createAccessToken(user);
    return res.json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------- LOGOUT ----------------
// ✅ With JWT in headers, logout is purely client-side now.
router.post("/logout", async (req, res) => {
  try {
    return res.status(200).json({ message: "Logout successful (client-side)" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// ---------------- GET CURRENT USER ----------------
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = req.user; // already attached in verifyToken
    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
});

// ---------------- SIGNUP ----------------
router.post("/email/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ ok: false, message: "User already exists" });
    }

    const hashPass = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashPass,
      provider: "email",
    });

    // ✅ Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "1d",
    });

    // ✅ Return token + user directly
    res.status(200).json({
      success: true,
      message: "User created successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("SignUp error", error);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

// ---------------- LOGIN ----------------
router.post("/email/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // ✅ Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "1d",
    });

    // ✅ Return token + user directly (no cookie)
    res.status(200).json({
      ok: true,
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login error", error);
    res.status(500).json({ message: "Server error" });
  }
});
export default router;
