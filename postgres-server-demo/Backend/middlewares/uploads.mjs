import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|webp/;
    const extname = fileTypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimetype =
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/webp";

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(
            new Error("Only .jpeg, .jpg, .png, and .webp files are allowed!"),
            false
        );
    }
};

const uploadProductImages = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: fileFilter,
}).array("images", 5);

export { uploadProductImages };
