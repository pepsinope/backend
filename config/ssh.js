import { Client } from 'ssh2';
import dotenv from 'dotenv';

// โหลดค่าจากไฟล์ .env
dotenv.config();

// ตั้งค่าการเชื่อมต่อ SSH
const sshConfig = {
  host: process.env.SSH_HOST,
  port: process.env.SSH_PORT || 22,
  username: process.env.SSH_USER,
  password: process.env.SSH_PASSWORD,
};

// ฟังก์ชั่นเชื่อมต่อ SSH และรันคำสั่งที่ส่งมา
export const runSSHCommand = (command, res) => {
  const conn = new Client();

  conn.on('ready', () => {
    console.log('✅ SSH Connected!');
    conn.exec(command, (err, stream) => {
      if (err) {
        console.error('❌ Error executing command:', err);
        return res.status(500).json({ message: 'Error executing command' });
      }

      let output = '';
      
      stream
        .on('data', (data) => {
          output += data.toString();
        })
        .on('end', () => {
          conn.end();
          console.log('✅ Command executed!');
          res.json({ output });
        })
        .stderr.on('data', (data) => {
          console.error('❌ STDERR:', data.toString());
        });
    });
  });

  conn.on('error', (err) => {
    console.error('❌ SSH Connection Error:', err);
    res.status(500).json({ message: 'SSH Connection Error' });
  });

  // เชื่อมต่อกับ SSH server
  console.log('🔄 Connecting to SSH server...');
  conn.connect(sshConfig);
};
