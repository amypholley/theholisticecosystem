const fs = require("node:fs/promises");
const path = require("node:path");
const formidableModule = require("formidable");

const formidable = formidableModule.formidable || formidableModule;
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mojzvolv";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const UPLOAD_REQUIRED_REASONS = new Set(["magazine-submission", "pet-contest"]);

function firstValue(value) {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

function firstFile(value) {
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
}

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      allowEmptyFiles: true,
      keepExtensions: true,
      maxFileSize: MAX_FILE_SIZE,
      multiples: false,
    });

    form.parse(req, (error, fields, files) => {
      if (error) {
        reject(error);
        return;
      }

      resolve({ fields, files });
    });
  });
}

function validateUpload(file) {
  if (!file || !file.size) return null;

  const extension = path.extname(file.originalFilename || "").toLowerCase();

  if (file.size > MAX_FILE_SIZE) {
    return "Please upload an image smaller than 10 MB.";
  }

  if (!ALLOWED_EXTENSIONS.has(extension) || !ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return "Please upload a JPG, PNG, or WebP image.";
  }

  return null;
}

async function removeTempFile(file) {
  if (!file || !file.filepath) return;
  await fs.unlink(file.filepath).catch(() => {});
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "This form only accepts POST submissions." });
    return;
  }

  let uploadedFile = null;

  try {
    const { fields, files } = await parseForm(req);
    uploadedFile = firstFile(files.pet_photo);

    const name = firstValue(fields.name).trim();
    const email = firstValue(fields.email).trim();
    const message = firstValue(fields.message).trim();
    const reason = firstValue(fields.reason).trim();
    const uploadError = validateUpload(uploadedFile);

    if (!name || !email || !message) {
      res.status(400).json({ error: "Please complete your name, email, and message." });
      return;
    }

    if (UPLOAD_REQUIRED_REASONS.has(reason) && (!uploadedFile || !uploadedFile.size)) {
      res.status(400).json({ error: "Please upload an image for this submission type." });
      return;
    }

    if (uploadError) {
      res.status(400).json({ error: uploadError });
      return;
    }

    const outbound = new FormData();
    const fieldNames = [
      "name",
      "email",
      "subject",
      "reason",
      "reason_display",
      "message",
    ];

    fieldNames.forEach((fieldName) => {
      outbound.append(fieldName, firstValue(fields[fieldName]));
    });

    outbound.append("_subject", `Website contact: ${firstValue(fields.subject) || "New submission"}`);

    if (uploadedFile && uploadedFile.size) {
      const fileBuffer = await fs.readFile(uploadedFile.filepath);
      const fileBlob = new Blob([fileBuffer], {
        type: uploadedFile.mimetype || "application/octet-stream",
      });

      outbound.append(
        "pet_photo",
        fileBlob,
        uploadedFile.originalFilename || "pet-photo"
      );
    }

    const formspreeResponse = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      body: outbound,
      headers: {
        Accept: "application/json",
      },
    });

    if (!formspreeResponse.ok) {
      const errorText = await formspreeResponse.text().catch(() => "");
      res.status(formspreeResponse.status).json({
        error:
          errorText ||
          "The form service could not accept this submission. Please try again.",
      });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    const isSizeError =
      error &&
      (error.code === 1009 ||
        error.httpCode === 413 ||
        String(error.message || "").toLowerCase().includes("maxfilesize"));

    res.status(isSizeError ? 413 : 500).json({
      error: isSizeError
        ? "Please upload an image smaller than 10 MB."
        : "The upload could not be processed. Please try again.",
    });
  } finally {
    await removeTempFile(uploadedFile);
  }
};

module.exports.config = {
  api: {
    bodyParser: false,
  },
};
