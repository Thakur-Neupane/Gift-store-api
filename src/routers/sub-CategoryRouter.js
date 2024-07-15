import express from "express";
import slugify from "slugify";
import { insertSubCategory } from "../models/sub-category/Sub-CategoryModal";

const router = express.Router();
router.post("/", async (req, res, next) => {
  try {
    const { title } = req.body;
    if (typeof title === "string" && title.length) {
      const slug = slugify(title, {
        lower: true,
      });

      const subCat = await insertSubCategory({
        title,
        slug,
      });

      if (subCat?._id) {
        return res.json({
          status: "success",
          message: "New Sub-category has been added",
        });
      }
    }

    res.json({
      status: "error",
      message: "Unable to add category, try again later",
    });
  } catch (error) {
    if (error.message.includes("E11000 duplicate")) {
      error.message =
        "This category slug already exist, please change the name of the Category and try agian.";
      error.statusCode = 200;
    }
    next(error);
  }
});

export default router;
