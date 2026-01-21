const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

const pool = new Pool({
  host: process.env.DB_HOST || "db",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

async function initDb() {
  // Create table if not exists (simple tasks table)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      done BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

// Health endpoints for Docker healthcheck & for you
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1;");
    res.status(200).json({ status: "ok" });
  } catch (e) {
    res.status(503).json({ status: "db_unavailable", error: e.message });
  }
});

// CRUD
app.get("/tasks", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM tasks ORDER BY id DESC;");
  res.json(rows);
});


app.post("/tasks", async (req, res) => {
  const title = (req.body?.title || "").trim();
  if (!title) return res.status(400).json({ error: "title is required" });

  const { rows } = await pool.query(
    "INSERT INTO tasks(title) VALUES($1) RETURNING *;",
    [title]
  );
  res.status(201).json(rows[0]);
});

app.put("/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "invalid id" });

  const title = req.body?.title;
  const done = req.body?.done;

  // Simple update: allow updating title and/or done
  const { rows } = await pool.query(
    `
    UPDATE tasks
    SET
      title = COALESCE($1, title),
      done  = COALESCE($2, done)
    WHERE id = $3
    RETURNING *;
    `,
    [title ?? null, typeof done === "boolean" ? done : null, id]
  );

  if (rows.length === 0) return res.status(404).json({ error: "not found" });
  res.json(rows[0]);
});

app.delete("/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "invalid id" });

  const result = await pool.query("DELETE FROM tasks WHERE id = $1;", [id]);
  if (result.rowCount === 0) return res.status(404).json({ error: "not found" });
  res.sendStatus(204);
});

(async () => {
  // Wait a bit for DB readiness with retries
  const maxAttempts = 30;
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      await pool.query("SELECT 1;");
      break;
    } catch (e) {
      if (i === maxAttempts) {
        console.error("DB not ready after retries:", e.message);
        process.exit(1);
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  await initDb();

  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });
})();
