import express from "express";
import os from "os";
import pg from "pg";
import dotenv from "dotenv";

const app = express();
app.use(express.json());
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

app.listen(3500, () => {
  console.log("Server is run");
});
