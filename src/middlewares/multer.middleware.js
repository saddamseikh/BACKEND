import multer from "multer";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage,
});
// // import multer from "multer";
// const upload = multer({
//   dest: "uploads/",
//   limits: { fileSize: 90 * 1024 * 1024 }, // 50 mb in size max limit
//   storage: multer.diskStorage({
//     destination: "uploads/",
//     filename: (_req, file, cb) => {
//       cb(null, file.originalname);
//     },
//   }),
//   //   fileFilter: (_req, file, cb) => {
//   //     let ext = path.extname(file.originalname);

//   //     if (
//   //       ext !== ".jpeg" &&
//   //       ext !== ".mp4" &&
//   //       ext !== ".mkv" &&
//   //       ext !== ".png" &&
//   //       ext !== ".mov"
//   //     ) {
//   //       cb(new Error(`Unsupported file type! ${ext}`), false);
//   //       return;
//   //     }

//   //     cb(null, true);
//   //   },
// });

// export default upload;
