import dotenv from 'dotenv';

// โหลดค่าจากไฟล์ .env
dotenv.config();

// ตั้งค่าการเชื่อมต่อ SSH

export const sshConfig = {
  host: process.env.SSH_HOST,
  port: process.env.SSH_PORT || 22,
  username: process.env.SSH_USER,
  password: process.env.SSH_PASSWORD,
  readyTimeout: 60000,
  execTimeout: 60000,
};

 

