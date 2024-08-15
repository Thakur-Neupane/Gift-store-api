import userRouter from "./userRouter.js";
import categoryRouter from "./categoryRouter.js";
import productRouter from "./productRouter.js";
import subCategoryRouter from "./subCategoryRouter.js";
import cloudinaryRouter from "./cloudinaryRouter.js";
import { auth } from "../middlewares/auth.js";

export default [
  {
    path: "/api/v1/users",
    middlewares: [userRouter],
  },
  {
    path: "/api/v1/categories",
    middlewares: [auth, categoryRouter],
  },
  {
    path: "/api/v1/products",
    middlewares: [productRouter],
  },
  {
    path: "/api/v1/sub-categories",
    middlewares: [auth, subCategoryRouter],
  },

  {
    path: "/api/v1/cloudinary",
    middlewares: [cloudinaryRouter],
  },
];
