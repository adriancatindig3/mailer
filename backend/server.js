import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sendEmailToOwner, sendEmailToVisitor } from "./mailer.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.post("/sendMail", async (req, res) => {
  try {
    const {
      visitorEmail,
      visitorName,
      visitorCompany,
      visitorPhone,
      visitorMessage,
      ownerEmail,
      ownerName,
    } = req.body;

    if (!visitorEmail || !ownerEmail || !visitorMessage || !visitorName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await sendEmailToOwner(
      ownerEmail,
      ownerName,
      visitorEmail,
      visitorMessage,
      visitorName,
      visitorCompany,
      visitorPhone
    );

    await sendEmailToVisitor(
      visitorEmail,
      visitorName,
      visitorCompany,
      visitorPhone,
      visitorMessage,
      ownerName
    );

    res.json({
      success: true,
      message: "Messages sent successfully",
    });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});