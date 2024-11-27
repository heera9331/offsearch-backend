import express from "express";
import dotenv from "dotenv";
import { generateToken, checkUser } from "./utils.js";
import { authenticate } from "./middelwares/auth.js";
import { prisma } from "./lib/prisma.js";
import bodyParser from "body-parser";
import cors from "cors";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get("/", async (req, res, next) => {
  return res.json({ meseage: "working" });
});

app.get("users", authenticate, async (req, res, next) => {});

app.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user.password !== password) {
      return res.status(500).json({ error: "user password not correct" });
    }

    const payload = { id: user.id, email: user.email };
    const token = generateToken(payload);

    return res.json({
      message: "user logined",
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

app.post("/register", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const newUser = await prisma.user.create({
      data: {
        email,
        password,
      },
    });

    return res.json({ user: newUser });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

// Get all records for the authenticated user
app.get("/user", checkUser, async (req, res) => {
  try {
    const records = await prisma.user.findMany({});
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch records." });
  }
});

app.post("/user", async (req, res) => {
  try {
    const { email, password } = req.body;
    try {
      const newUser = await prisma.user.create({
        data: {
          email,
          password,
        },
      });

      return res.json({ user: newUser });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to fetch records." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch records." });
  }
});

// Get all records for the authenticated user
app.get("/record", checkUser, async (req, res) => {
  try {
    const records = await prisma.record.findMany({
      where: { userId: req.userId },
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch records." });
  }
});

// Create a new record
app.post("/record", checkUser, async (req, res) => {
  const { impression, clicks, cpm, earnings, createdAt } = req.body;

  try {
    const newRecord = await prisma.record.create({
      data: {
        impression,
        clicks,
        cpm,
        earnings,
        createdAt: new Date(createdAt), // Parse date from request
        userId: req.userId,
      },
    });
    res.status(201).json(newRecord);
  } catch (error) {
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
    const updatedRecord = await prisma.record.updateMany({
      where: {
        id: parseInt(id, 10),
        userId: req.userId, // Ensure the record belongs to the user
      },
      data: {
        impression,
        clicks,
        cpm,
        earnings,
      },
    });

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
    const deletedRecord = await prisma.record.deleteMany({
      where: {
        id: parseInt(id, 10),
        userId: req.userId, // Ensure the record belongs to the user
      },
    });

    if (deletedRecord.count === 0) {
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
    const methods = await prisma.paymentMethod.findMany({});

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

    const method = await prisma.paymentMethod.findUnique({
      where: {
        id,
      },
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

    const isExists = await prisma.paymentMethod.findUnique({
      where: {
        userId: req.userId,
      },
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
        userId: req.userId,
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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`server running on port ${PORT}`);
});
