import { Client } from "ssh2";
import { sshConfig } from '../config/ssh.js';
import pool from "../config/db.js";

let isRunning = {};
const runningTasks = {};

export const startCommand = (req, res) => {
    const { boxType } = req.body;
    if (!boxType) return res.status(400).json({ error: "Missing 'boxType' in request body" });

    if (runningTasks[boxType]) return res.status(400).json({ error: `${boxType} is already running` });

    runningTasks[boxType] = true;
    isRunning[boxType] = true;

    let command = "";
    if (boxType === "Flood") {
        command = "cd /home/jpss/suphattra && chmod +x run_flood2.sh && ./run_flood2.sh";
    } else {
        return res.status(400).json({ error: "Invalid box type" });
    }

    const conn = new Client();
    conn.on("ready", () => {
        console.log(`✅ SSH Connected for ${boxType}`);
        conn.exec(command, (err, stream) => {
            if (err) {
                console.error("❌ SSH Error:", err);
                conn.end();
                isRunning[boxType] = false;
                delete runningTasks[boxType];
                return res.status(500).json({ error: "SSH command failed" });
            }

            let output = "";
            stream.on("data", (data) => {
                output += data.toString();
            });

            stream.on("close", async () => {
                console.log(`🔴 SSH Connection Closed for ${boxType}`);
                conn.end();
                isRunning[boxType] = false;
                delete runningTasks[boxType];

                const tifFileMatch = output.match(/([a-zA-Z0-9_\-]+\.tif)/);
                const tifFile = tifFileMatch ? tifFileMatch[0] : null;
                const processStatus = tifFile ? 1 : 2;
                const saveStatus = tifFile ? 1 : 2;

                if (tifFile) {
                    pool.query(
                        "INSERT INTO snpp (filename, date, name_software, process_status, save_status) VALUES (?, CURDATE(), ?, ?, ?) ON DUPLICATE KEY UPDATE process_status = VALUES(process_status), save_status = VALUES(save_status)",
                        [tifFile, boxType, processStatus, saveStatus],
                        (err) => {
                            if (err) {
                                console.error("❌ Database Error:", err);
                                return res.status(500).json({ error: "Database error" });
                            }
                            return res.json({ message: "Process complete", tif_file: tifFile, process_status: 1, save_status: 1 });
                        }
                    );
                } else {
                    return res.json({ message: "No TIF file found", process_status: 2, save_status: 2 });
                }
            });
        });
    });

    conn.on("error", (err) => {
        console.error(`❌ SSH Error:`, err);
        isRunning[boxType] = false;
        delete runningTasks[boxType];
        res.status(500).json({ error: "SSH Connection Failed" });
    });

    conn.connect(sshConfig);
    res.json({ message: `Started ${boxType}` });
};




// import { Client } from "ssh2";

// const isRunning = {};
// export const progressStates = {};
// const runningTasks = {};

// export const executeCommand = (req, res) => {
//   const { boxType } = req.body;
//   if (!boxType) return res.status(400).json({ error: "Missing 'boxType'" });
//   if (runningTasks[boxType]) return res.status(400).json({ error: `${boxType} is already running` });

//   runningTasks[boxType] = true;
//   progressStates[boxType] = 0;
//   isRunning[boxType] = true;

//   let command = "";
//   switch (boxType) {
//     case "Flood":
//       command = "cd /home/jpss/suphattra && chmod +x run_flood2.sh && ./run_flood2.sh";
//       break;
//     default:
//       return res.status(400).json({ error: "Invalid box type" });
//   }

//   const conn = new Client();

// console.log("🟡 Connecting to SSH...");
// conn.connect(sshConfig);

// conn.on("ready", () => {
//   console.log(`✅ SSH Connected for ${boxType}`);
//   console.log(`🔹 Running command: ${command}`);

//   conn.exec(command, (err, stream) => {
//     if (err) {
//       console.error("❌ Error executing command:", err);
//       return handleError(err, conn, boxType, res);
//     }

//     let output = "";
//     const interval = setInterval(() => {
//       if (progressStates[boxType] < 95) progressStates[boxType] += 5;
//     }, 1000);

//     stream.on("data", (data) => {
//       console.log(`📥 Output from server: ${data.toString()}`);
//       output += data.toString();
//       if (output.includes(".tif")) {
//         progressStates[boxType] = 100;
//         clearInterval(interval);
//       }
//     });

//     stream.on("close", () => {
//       console.log("🔴 SSH process closed");
//       clearInterval(interval);
//       conn.end();
//       finalizeProcess(boxType, output, res);
//     });
//   });
// });

// conn.on("error", (err) => {
//   console.error(`❌ SSH Error for ${boxType}:`, err);
//   handleError(err, conn, boxType, res);
// });}

// const handleError = (err, conn, boxType, res) => {
//   console.error(`❌ SSH Error for ${boxType}:`, err);
//   isRunning[boxType] = false;
//   delete runningTasks[boxType];
//   conn.end();
//   res.status(500).json({ error: "SSH Connection Failed" });
// };

// const finalizeProcess = (boxType, output, res) => {
//   isRunning[boxType] = false;
//   delete runningTasks[boxType];

//   const tifFileMatch = output.match(/([a-zA-Z0-9_\-]+\.tif)/);
//   const tifFile = tifFileMatch ? tifFileMatch[0] : null;
//   const processStatus = tifFile ? 1 : 2;
//   const saveStatus = tifFile ? 1 : 2;

//   db.query(
//     "INSERT INTO snpp (filename, date, name_software, process_status, save_status) VALUES (?, CURDATE(), ?, ?, ?) ON DUPLICATE KEY UPDATE process_status = VALUES(process_status), save_status = VALUES(save_status)",
//     [tifFile, boxType, processStatus, saveStatus],
//     (err) => {
//       if (err) return res.status(500).json({ error: "Database error" });
//       res.json({
//         message: "Process complete",
//         tif_file: tifFile,
//         process_status: processStatus,
//         save_status: saveStatus,
//       });
//     }
//   );
// };

// export default executeCommand;

