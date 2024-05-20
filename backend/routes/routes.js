import {
  showAllUsers,
  addUser,
  editUser,
  logInUser,
} from "../controller/users.js";
import {
  showAllBlogs,
  displayUserBlogs,
  addBlog,
  editBlog,
  removeBlog,
  show3Blogs,
} from "../controller/blogs.js";

import express from "express";
const router = express.Router();

router.get("/", showAllUsers);

router.post("/registerUser", addUser);

router.put("/updateUser/:id", editUser);

router.post("/loginUser", logInUser);

router.get("/allBlogs", showAllBlogs);

router.get("/userBlogs/:id", displayUserBlogs);

router.get("/blogs", show3Blogs);

router.post("/postBlog/:id", addBlog);

router.put("/updateBlog/:id", editBlog);

router.delete("/deleteBlog/:id", removeBlog);

export default router;
