import express from "express";
const router = express.Router();
import slugify from "slugify";
import {
  getAllCategories,
  insertCategory,
} from "../models/category/CategoryModel.js";
import { auth } from "../middlewares/auth.js";

router.post("/", async (req, res, next) => {
  try {
    const { title } = req.body;
    if (typeof title === "string" && title.length) {
      const slug = slugify(title, {
        lower: true,
      });

      const cat = await insertCategory({
        title,
        slug,
      });

      if (cat?._id) {
        return res.json({
          status: "success",
          message: "New category has been added",
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

router.get("/", async (req, res, next) => {
  try {
    const categories = await getAllCategories();
    res.json({
      status: "success",
      message: "New category has been added",
      categories,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
