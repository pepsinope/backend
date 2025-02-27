import { Client } from 'ssh2';
import { sshConfig } from '../config/ssh.js';
import path from 'path';
import axios from 'axios';

// ฟังก์ชันสร้างโฟลเดอร์บนเซิร์ฟเวอร์
export const createRemoteFolder = async (folderPath) => {
  const conn = new Client();
  
  return new Promise((resolve, reject) => {
    console.log("🔑 กำลังเชื่อมต่อ SSH เพื่อสร้างโฟลเดอร์...");

    conn.on('ready', () => {
      console.log(`✅ เชื่อมต่อสำเร็จ กำลังสร้างโฟลเดอร์: ${folderPath}`);

      const command = `mkdir -p ${folderPath}`;
      conn.exec(command, (err, stream) => {
        if (err) {
          console.error("❌ การสร้างโฟลเดอร์ล้มเหลว:", err);
          reject(new Error(`การสร้างโฟลเดอร์ล้มเหลว: ${err.message}`));
        } else {
          stream.on('close', () => {
            console.log(`📂 สร้างโฟลเดอร์สำเร็จ: ${folderPath}`);
            conn.end();
            resolve();
          });

          stream.on('data', (data) => {
            console.log(`📄 [stdout] ${data.toString()}`);
          });

          stream.stderr.on('data', (data) => {
            console.error(`🚨 [stderr] ${data.toString()}`);
          });
        }
      });
    }).on('error', (err) => {
      console.error("❌ การเชื่อมต่อ SSH ล้มเหลว:", err);
      reject(new Error(`การเชื่อมต่อ SSH ล้มเหลว: ${err.message}`));
    }).connect(sshConfig);
  });
};

// ฟังก์ชันลบโฟลเดอร์บนเซิร์ฟเวอร์
export const removeRemoteFolder = async (folderPath) => {
  const conn = new Client();

  return new Promise((resolve, reject) => {
    console.log("🔑 กำลังเชื่อมต่อ SSH เพื่อถอนการติดตั้ง...");

    conn.on('ready', () => {
      console.log(`✅ เชื่อมต่อสำเร็จ กำลังลบโฟลเดอร์: ${folderPath}`);

      const command = `rm -rf ${folderPath}`;
      conn.exec(command, (err, stream) => {
        if (err) {
          console.error("❌ การลบโฟลเดอร์ล้มเหลว:", err);
          reject(new Error(`การลบโฟลเดอร์ล้มเหลว: ${err.message}`));
        } else {
          stream.on('close', () => {
            console.log(`🗑️ ลบโฟลเดอร์สำเร็จ: ${folderPath}`);
            conn.end();
            resolve();
          });

          stream.on('data', (data) => {
            console.log(`📄 [stdout] ${data.toString()}`);
          });

          stream.stderr.on('data', (data) => {
            console.error(`🚨 [stderr] ${data.toString()}`);
          });
        }
      });
    }).on('error', (err) => {
      console.error("❌ การเชื่อมต่อ SSH ล้มเหลว:", err);
      reject(new Error(`การเชื่อมต่อ SSH ล้มเหลว: ${err.message}`));
    }).connect(sshConfig);
  });
};

// ฟังก์ชันดาวน์โหลดไฟล์จาก URL และอัปโหลดไปยังเซิร์ฟเวอร์
export const downloadAndUploadFiles = async (files, remotePath) => {
  const conn = new Client();

  return new Promise((resolve, reject) => {
    console.log(`🔑 กำลังเชื่อมต่อ SSH...`);

    conn.on('ready', async () => {
      console.log(`✅ เชื่อมต่อกับเซิร์ฟเวอร์สำเร็จ: ${sshConfig.host}`);

      try {
        // สร้างโฟลเดอร์บนเซิร์ฟเวอร์ถ้ายังไม่มี
        await createRemoteFolder(remotePath);

        // สร้าง SFTP session
        conn.sftp(async (err, sftp) => {
          if (err) {
            console.error("❌ SFTP connection error:", err);
            conn.end();
            reject(new Error(`SFTP connection error: ${err.message}`));
            return;
          }

          const uploadedFiles = []; // เก็บรายชื่อไฟล์ที่อัปโหลดสำเร็จ

          for (const file of files) {
            const fileUrl = file.url;
            const fileName = path.basename(fileUrl);
            const fileExtension = fileName.split('.').pop().toLowerCase();

            // ข้ามไฟล์ PDF
            if (fileExtension === 'pdf') {
              console.log(`⏩ ข้ามการอัปโหลดไฟล์ PDF: ${fileName}`);
              continue;
            }

            try {
              console.log(`🔽 กำลังดาวน์โหลดไฟล์จาก: ${fileUrl}`);
              const response = await axios({
                url: fileUrl,
                method: 'GET',
                responseType: 'stream',
              });

              console.log(`✅ ดาวน์โหลดไฟล์สำเร็จ: ${fileUrl}`);

              const remoteFilePath = path.join(remotePath, fileName).replace(/\\/g, '/');
              const writeStream = sftp.createWriteStream(remoteFilePath);

              response.data.pipe(writeStream);

              await new Promise((resolveWrite, rejectWrite) => {
                writeStream.on('close', () => {
                  console.log(`✅ อัปโหลดไฟล์เสร็จสมบูรณ์: ${remoteFilePath}`);
                  uploadedFiles.push(remoteFilePath); // บันทึกไฟล์ที่อัปโหลด
                  resolveWrite();
                });

                writeStream.on('error', (error) => {
                  console.error("❌ การอัปโหลดไฟล์ล้มเหลว:", error);
                  rejectWrite(error);
                });
              });
            } catch (error) {
              console.error('❌ เกิดข้อผิดพลาดในการดาวน์โหลดหรืออัปโหลด:', error);
            }
          }

          console.log("📦 เริ่มแตกไฟล์ทั้งหมด...");
          for (const filePath of uploadedFiles) {
            try {
              await extractTarFile(conn, filePath, remotePath);
            } catch (error) {
              console.error("❌ การแตกไฟล์ล้มเหลว:", error);
            }
          }

          // ปิดการเชื่อมต่อหลังจากทุกอย่างเสร็จ
          console.log("🔚 ปิดการเชื่อมต่อ SSH...");
          conn.end();
          resolve();
        });
      } catch (err) {
        console.error('❌ เกิดข้อผิดพลาดในการสร้างโฟลเดอร์:', err);
        reject(err);
      }
    }).on('error', (err) => {
      console.error("❌ การเชื่อมต่อ SSH ล้มเหลว:", err);
      reject(new Error(`การเชื่อมต่อ SSH ล้มเหลว: ${err.message}`));
    }).connect(sshConfig);
  });
};

export const extractTarFile = (conn, filePath, extractPath) => {
  return new Promise((resolve, reject) => {
    const extractCommand = `tar -xzf ${filePath} -C ${extractPath}`;
    console.log(`📦 สั่งแตกไฟล์: ${filePath}`);

    conn.exec(extractCommand, { timeout: 900000 }, (err, stream) => {
      if (err) {
        console.error("❌ การแตกไฟล์ล้มเหลว:", err);
        return reject(err);
      }

      stream.on('close', (code) => {
        console.log(`📦 แตกไฟล์เสร็จสิ้น (exit code: ${code})`);
        resolve();
      });

      stream.on('data', (data) => {
        console.log(`📄 [stdout] ${data}`);
      });

      stream.stderr.on('data', (data) => {
        console.error(`🚨 [stderr] ${data}`);
      });
    });
  });
};
