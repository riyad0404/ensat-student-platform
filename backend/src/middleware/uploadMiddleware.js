import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

// 1) S'assurer que le dossier uploads existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 2) Stockage disque
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);

    const safeBase = base
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "");

    cb(null, `${Date.now()}-${safeBase}${ext}`);
  },
});

// 3) Filtre (tout passe)
const fileFilter = (req, file, cb) => {
  cb(null, true);
};

// 4) Limite taille
const limits = {
  fileSize: 25 * 1024 * 1024,
};

// 5) Instance multer
const uploader = multer({ storage, fileFilter, limits });

// Exports
export const uploadSingle = uploader.single("file");
export const uploadMany = uploader.array("files", 10);
export const uploadAny = uploader.any();

export const multerErrorHandler = (err, req, res, next) => {
  if (!err) return next();

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "Fichier trop grand (max 25MB)." });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        message: "Champ fichier inattendu. Utilise 'file' ou 'files'.",
      });
    }
    return res.status(400).json({ message: `Erreur upload: ${err.code}` });
  }

  return res.status(500).json({ message: "Erreur serveur pendant l'upload." });
};
