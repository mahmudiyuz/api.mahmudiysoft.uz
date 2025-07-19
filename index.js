import express from "express";
import os from "os";
import pg from "pg";
import dotenv from "dotenv";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["https://mahmudiysoft.uz", "http://127.0.0.1:5500"],
    methods: ["POST"],
    credentials: true,
  })
);
dotenv.config();

const { Pool } = pg;
const pool = new Pool();

app.post(`/create-message`, async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const userDevice = {
      computer: {
        name: os.hostname(),
        work_time: os.uptime(),
      },
      processor: {
        model: os.cpus()[0].model,
        speed: os.cpus()[0].speed,
      },
      operating_system: {
        name: os.platform(),
        cpu_architecture: os.arch(),
      },
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
      },
      networkInterfaces: Object.keys(os.networkInterfaces()),
    };

    const result = await pool.query(
      `
        insert into ms_messages (name, email, message, user_device)
        values ($1, $2, $3, $4)
        returning *;
      `,
      [name, email, message, JSON.stringify(userDevice)]
    );

    res
      .status(201)
      .json({ message: "Message sent successfuly!", data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is run");
});
