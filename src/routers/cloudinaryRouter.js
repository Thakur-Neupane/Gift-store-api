import express from "express";
import cloudinary from "cloudinary";

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Route to handle image uploads
router.post("/uploadimages", async (req, res) => {
  try {
    const { images } = req.body;

    // Validate images input
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: "Invalid images data provided" });
    }

    // Check if images are in base64 format or URLs
    const uploadPromises = images.map((image) =>
      cloudinary.v2.uploader.upload(image, {
        folder: "product_images",
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png"],
      })
    );

    // Upload images
    const results = await Promise.all(uploadPromises);

    // Map to desired response format
    const uploadedImages = results.map((result) => ({
      url: result.secure_url,
      public_id: result.public_id,
    }));

    res.status(200).json(uploadedImages);
  } catch (error) {
    console.error("Image upload error:", error);
    res
      .status(500)
      .json({ message: "Image upload failed", error: error.message });
  }
});

// Route to handle image removal
router.post("/removeimages", async (req, res) => {
  try {
    const { public_id } = req.body;

    // Validate public_id input
    if (!public_id) {
      return res.status(400).json({ message: "Public ID is required" });
    }

    // Remove image
    const result = await cloudinary.v2.uploader.destroy(public_id);

    // Check result
    if (result.result === "ok") {
      res.status(200).json({ message: "Image removed successfully" });
    } else {
      res
        .status(400)
        .json({ message: "Image removal failed", reason: result.result });
    }
  } catch (error) {
    console.error("Image remove error:", error);
    res
      .status(500)
      .json({ message: "Image removal failed", error: error.message });
  }
});

export default router;
