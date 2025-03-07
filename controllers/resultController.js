import pool from "../config/db.js";

export const addResult = async (req, res) => {
  const { date, filename, image, status, save } = req.body;

  try {
    const [results] = await pool.query(
      "INSERT INTO snpp (date, filename, image, status, save) VALUES (?, ?, ?, ?, ?)",
      [date, filename, image, status, save]
    );

    res.status(201).json({ message: "✅ New result added!", results });
  } catch (err) {
    console.error("❌ Error inserting data:", err);
    res.status(500).json({ message: "Something went wrong!", error: err.message });
  }
};


export const getResults = async (req, res) => {
  try {
    const [results] = await pool.query("SELECT * FROM snpp");
    res.status(200).json(results);
  } catch (err) {
    console.error("❌ Error fetching data:", err);
    res.status(500).json({ message: "Something went wrong!", error: err.message });
  }
};
