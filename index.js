import express from "express";
import dotenv from "dotenv";
import { generateToken, checkUser } from "./utils.js";
import { authenticate } from "./middelwares/auth.js";
import { prisma } from "./lib/prisma.js";
import bodyParser from "body-parser";
import cors from "cors";
import { connectDB } from "./lib/mongo.js";
import { User, Record, PaymentMethod } from "./models/index.js";
import jwt from "jsonwebtoken";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get("/", async (req, res, next) => {
  return res.json({ meseage: "working" });
});

app.get("user", authenticate, async (req, res, next) => {});

app.post("user", authenticate, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(404).json({ error: "Email or password missing" });
    }
    const user = await User.insertMany([{ email, password }]);
    return res.json({ user });
  } catch (error) {
    console.log(error);
    return res.status(505).json({ error });
  }
});

app.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    console.log(user);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Validate password
    const isPasswordValid = user.password === password;
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT
    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.json({
      message: "User logged in",
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An unexpected error occurred" });
  }
});

app.post("/register", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const newUser = await User.insertMany([
      {
        email,
        password,
      },
    ]);
    return res.json({ user: newUser });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

app.get("/user", checkUser, async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

app.post("/user", async (req, res) => {
  try {
    const { email, password } = req.body;
    try {
      const newUser = await User.insertMany([
        {
          email,
          password,
        },
      ]);

      return res.json({ user: newUser });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "User already exist" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

// Get all records for the authenticated user
app.get("/record", checkUser, async (req, res) => {
  try {
    const records = await Record.find({ userId: req.userId });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch records." });
  }
});

app.get("/records", async (req, res) => {
  try {
    const records = await Record.find({});
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch records." });
  }
});

// Create a new record
app.post("/record", async (req, res) => {
  const { impression, clicks, cpm, earnings, createdAt, userId } = req.body;

  try {
    const newRecord = await Record.insertMany([
      {
        impression,
        clicks,
        cpm,
        earnings,
        createdAt: new Date(createdAt),
        userId,
      },
    ]);
    return res.status(201).json(newRecord);
  } catch (error) {
    console.log(error);
    if (error.code === "P2002") {
      // Unique constraint violation
      res.status(400).json({ error: "Record for this date already exists." });
    } else {
      res.status(500).json({ error: "Failed to create record." });
    }
  }
});

// Update an existing record
app.put("/record:id", checkUser, async (req, res) => {
  const { id } = req.params;
  const { impression, clicks, cpm, earnings } = req.body;

  try {
    const updatedRecord = await Record.UpdateOne(
      { _id: id },
      { impression, clicks, cpm, earnings }
    );

    if (updatedRecord.count === 0) {
      return res
        .status(404)
        .json({ error: "Record not found or access denied." });
    }

    res.json({ message: "Record updated successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to update record." });
  }
});

// Delete a record
app.delete("record/:id", checkUser, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedRecord = await Record.deleteOne({ _id: id });
    if (deletedRecord) {
      return res
        .status(404)
        .json({ error: "Record not found or access denied." });
    }

    res.json({ message: "Record deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete record." });
  }
});

app.post("/logout", (req, res) => {
  // Invalidate the token on the client side
  res.status(200).json({ message: "Logged out successfully" });
});

app.get("/payment-method/", checkUser, async (req, res, next) => {
  try {
    const methods = await PaymentMethod.find({});

    if (!methods) {
      return res.status(404).json({ error: "No payment method not found" }); // Use 404 status for "not found"
    }

    return res.json({
      paymentMethod: methods,
      message: "Payment method retrieved successfully", // Correct message grammar
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Failed to retrieve payment method." }); // Correct error message
  }
});

app.get("/payment-method/:id", checkUser, async (req, res, next) => {
  try {
    const { id } = req.params; // Use id from params and treat it as type
    const userId = req.userId; // Ensure this is the correct user ID extraction

    const method = await Record.findOne({
      _id: id,
      userId,
    });

    if (!method) {
      return res.status(404).json({ error: "Payment method not found" }); // Use 404 status for "not found"
    }

    return res.json({
      paymentMethod: method,
      message: "Payment method retrieved successfully", // Correct message grammar
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Failed to retrieve payment method." }); // Correct error message
  }
});

app.post("/payment-method", checkUser, async (req, res, next) => {
  try {
    const {
      type,
      bankName,
      bankNumber,
      ifscCode,
      holderName,
      upiId,
      paypalEmail,
    } = req.body;

    const userId = req.userId;

    const isExists = await PaymentMethod.findOne({
      userId,
      type,
    });

    if (isExists) {
      return res.status(500).json({ error: "Payment method already exist." });
    }

    const newPaymentMethod = await prisma.paymentMethod.create({
      data: {
        type,
        bankName,
        bankNumber,
        ifscCode,
        holderName,
        upiId,
        paypalEmail,
        userId,
      },
    });

    return res.json({
      paymentMethod: newPaymentMethod,
      message: "Pyament method added",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "Failed to create Pyament method record." });
  }
});

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`server running on port http://localhost:${PORT}`);
  await connectDB();
});
