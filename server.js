<<<<<<< HEAD
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
=======
/* const express = require('express')
const mysql = require ('mysql2')
>>>>>>> 8679a2f92399370fe920fbd0c37cf2282ff09cab
const app = express();

// ตั้งค่าการใช้ JSON และ CORS
app.use(express.json());
app.use(cors());  // เปิดการใช้งาน CORS เพื่อให้ Frontend เข้าถึง API ได้

// เชื่อมต่อ MySQL Database
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cspp_database',
    port: 3306
});

// เชื่อมต่อฐานข้อมูลด้วย pool
pool.getConnection((err, connection) => {
    if (err) {
        console.log('Error connecting to MySQL database = ', err);
        return;
    }
    console.log('MySQL successfully connected!');
    connection.release(); // คืน connection หลังจากเชื่อมต่อ
});

// API เพิ่มข้อมูลผลลัพธ์
app.post("/add-result", async (req, res) => {
    const { date, filename, image, status, save } = req.body;

    try {
        pool.query(
            "INSERT INTO snpp (date, filename, image, status, save) VALUES (?, ?, ?, ?, ?)",
            [date, filename, image, status, save],
            (err, results) => {
                if (err) {
                    console.log("Error inserting data:", err);
                    return res.status(400).send();
                }
                res.status(201).json({ message: "New result added!" });
            }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

// API อ่านข้อมูลผลลัพธ์จากฐานข้อมูล
app.get("/results", async (req, res) => {
    try {
        pool.query("SELECT * FROM snpp", (err, results) => {
            if (err) {
                console.log(err);
                return res.status(400).send();
            }
            res.status(200).json(results);
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

<<<<<<< HEAD
// เริ่มต้นเซิร์ฟเวอร์ที่พอร์ต 3000
app.listen(3000, () => console.log('Server is running on port 3000'));
=======

//read single users from db
app.get("/read/single/:email", async (req,res) => {
    const email = req.params.email;



    try {
        connection.query("SELECT * FROM users WHERE email = ?", [email], (err, results, fields) => {
            if (err) {
                console.log(err);
                return res.status(400).send();
            }
            res.status(200).json(results)
        })
    } catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})


//update data
app.patch("/update/:email", async (req, res) => {
    const email = req.params.email;
    const newPassword = req.body.newPassword;

    try {
        connection.query("UPDATE users SET password = ? WHERE email = ?", [newPassword, email], (err, results, fields) => {
            if (err) {
                console.log(err);
                return res.status(400).send();
            }
            res.status(200).json({message: "User password Updated successfully"})
        })
    } catch(err) {
        console.log(err);
        return res.status(500).send();
    }

})


//Delete
app.delete("/delete/:email", async (req, res) => {
    const email = req.params.email;

    try {
        connection.query("DELETE FROM users WHERE email = ?", [email], (err, results, fields) => {
            if (err) {
                console.log(err);
                return res.status(400).send();
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({message: "No user with that email!"});
            }
            return res.status(200).json({message: "User deleted successfully!"});
        })
    } catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})




app.listen(3000, () => console.log('Server is running on port 3000')); */
const express = require("express");
const bodyParser = require("body-parser");
const { downloadAndExtract } = require("./controllers/installController");  // เพิ่มการ import ฟังก์ชัน

const app = express();
const PORT = 3000;

app.use(bodyParser.json());  // ใช้ bodyParser สำหรับรับข้อมูลแบบ JSON

// เพิ่ม API ที่รับ POST request
app.post("/api/install", downloadAndExtract);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

>>>>>>> 8679a2f92399370fe920fbd0c37cf2282ff09cab
