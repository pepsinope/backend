import express from "express";
import { startCommand } from "../controllers/commandController.js";

const router = express.Router();

router.post("/start-command", startCommand);

export default router;



// // import express from "express";
// // import { executeCommand } from "../controllers/sshController.js";

// // const router = express.Router();

// // router.post("/start-command", executeCommand);

// // export default router;

// import express from "express";
// import { executeCommand, progressStates } from "../controllers/commandController.js";;

// const router = express.Router();

// router.post("/start-command", executeCommand);
// router.get("/check-progress", (req, res) => {
//   res.json(progressStates);
// });

// export default router;
