import userRouter from "./userRouter.js";
import categoryRouter from "./categoryRouter.js";
import productRouter from "./productRouter.js";
import subCategoryRouter from "./subCategoryRouter.js";
import cloudinaryRouter from "./cloudinaryRouter.js";
import reviewRouter from "./reviewRouter.js";
import cartRouter from "./cartRouter.js";
import couponRouter from "./couponRouter.js";
import { auth } from "../middlewares/auth.js";

export default [
  {
    path: "/api/v1/users",
    middlewares: [userRouter],
  },
  {
    path: "/api/v1/categories",
    middlewares: [categoryRouter],
  },
  {
    path: "/api/v1/products",
    middlewares: [productRouter],
  },
  {
    path: "/api/v1/sub-categories",
    middlewares: [subCategoryRouter],
  },

  {
    path: "/api/v1/cloudinary",
    middlewares: [cloudinaryRouter],
  },

  {
    path: "/api/v1/reviews",
    middlewares: [reviewRouter],
  },
  {
    path: "/api/v1/checkout",
    middlewares: [cartRouter],
  },
  {
    path: "/api/v1/coupons",
    middlewares: [couponRouter],
  },
];
