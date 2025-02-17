import { runSSHCommand } from '../config/ssh.js';

export const runCommand = (req, res) => {
  // คำสั่งที่คุณต้องการรัน
  const command = `
    cd mo && cd CSPP && cd SDR_4_0 && cd bin && 
    export CSPP_SDR_HOME=/home/jpss/mo/CSPP/SDR_4_0 && 
    ./sdr_luts.sh && ./sdr_ancillary.sh &&
    ./viirs_sdr.sh /home/jpss/mo/cspp_sdr_test_data/viirs_test/input_j01RNSCA-RVIRS_j01_d20240911_t1955034_e2006262_b00001_c20240911200637112000_drlu_ops.h5
  `;
  
  // เรียกฟังก์ชั่น runSSHCommand พร้อมคำสั่งที่ต้องการรัน
  runSSHCommand(command, res);
};
