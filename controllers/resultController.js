import pool from "../config/db.js";

export const addResult = (req, res) => {
  const { date, filename, image, status, save } = req.body;

  pool.query(
    "INSERT INTO snpp (date, filename, image, status, save) VALUES (?, ?, ?, ?, ?)",
    [date, filename, image, status, save],
    (err, results) => {
      if (err) {
        console.log("❌ Error inserting data:", err);
        return res.status(400).send();
      }
      res.status(201).json({ message: "✅ New result added!" });
    }
  );
};

export const getResults = (req, res) => {
  pool.query("SELECT * FROM snpp", (err, results) => {
    if (err) {
      console.log("❌ Error fetching data:", err);
      return res.status(400).send();
    }
    res.status(200).json(results);
  });
};
