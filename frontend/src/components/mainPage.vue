<template>
  <div>
    <div class="d-flex align-center flex-column bg-grey-lighten-4 pa-6">
      <v-btn-toggle @click="editBlog = !editBlog" divided>
        <v-btn icon="mdi-format-align-justify"></v-btn>
      </v-btn-toggle>
    </div>

    <div class="blog-container">
      <v-card
        variant="tonal"
        class="pa-2 ma-3 blog-card"
        width="370"
        v-for="blogs in AllBlogs"
        :key="blogs.b_id"
      >
        <div v-if="editBlog" class="editButton">
          <v-icon
            @click="OpenEditDialog(blogs)"
            icon="mdi-pencil-circle-outline"
            color="green-darken-4"
          ></v-icon>
        </div>
        <div v-if="editBlog" class="deleteButton">
          <v-icon
            @click="showDeleteDialog(blogs)"
            icon="mdi-delete"
            color="red-darken-4"
          ></v-icon>
        </div>
        <h2 class="text-decoration-underline mb-3">{{ blogs.b_title }}</h2>
        <img :src="blogs.b_picture" alt="Blog Image" class="mb-2 image" />

        <p class="mb-2">{{ truncateText(blogs.b_description, 7) }}</p>
        <router-link
          :to="{
            name: 'viewBlog',
            params: { id: $store.state.loggedInUserId, blogid: blogs.b_id },
          }"
        >
          <v-btn
            class="viewBlogButton"
            variant="outlined"
            @click="setBlogId(blogs)"
            >View Blog</v-btn
          >
        </router-link>
      </v-card>
    </div>

    <v-dialog v-model="removeBlogDialog" max-width="400" persistent>
      <v-card
        prepend-icon="mdi-delete"
        text="Are U sure You Want To Delete This Blog ?"
        title="Delete Blog"
      >
        <template v-slot:actions>
          <v-spacer></v-spacer>

          <v-btn
            @click="removeBlogDialog = false"
            variant="tonal"
            color="black-darken-2"
            class="font-weight-medium"
          >
            No
          </v-btn>
          <v-btn
            @click="deleteBlog()"
            variant="tonal"
            color="blue-darken-4"
            class="ml-2 font-weight-medium"
          >
            Yes
          </v-btn>
        </template>
      </v-card>
    </v-dialog>

    <v-dialog
      persistent
      width="600"
      class="custom-height"
      v-model="openEditDialog"
    >
      <template v-slot:default="{}">
        <v-card>
          <h2 class="text-decoration-underline ma-5">Update Blog</h2>
          <v-card-text>
            <v-text-field
              v-model="selectedBlog.b_title"
              type="text"
              :readonly="loading"
              :rules="[required]"
              label="Title"
              placeholder="Edit title of blog"
              clearable
            ></v-text-field>

            <v-text-field
              v-model="selectedBlog.b_author"
              type="text"
              :readonly="loading"
              :rules="[required]"
              label="Author"
              placeholder="Edit author name"
              clearable
            ></v-text-field>

            <v-textarea
              v-model="selectedBlog.b_description"
              type="text"
              :readonly="loading"
              :rules="[required]"
              label="Description"
              placeholder="Edit description of blog"
              clearable
            ></v-textarea>

            <v-file-input
              v-model="selectedBlog.b_picture"
              name="image"
              @change="handleFileChange($event)"
            >
              <template v-slot:selection="{ text }">
                <v-avatar v-if="imageUrl" size="30" class="mr-3 rounded">
                  <img :src="imageUrl" alt="Selected Image" />
                </v-avatar>
                {{ text }}
              </template>
            </v-file-input>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn
              text="Close"
              variant="tonal"
              class="font-weight-bold"
              @click="openEditDialog = false"
            ></v-btn>
            <v-btn
              text="Update"
              variant="tonal"
              class="font-weight-bold"
              color="blue-darken-4"
              @click="updateBlog"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      AllBlogs: [],
      editBlog: false,
      openEditDialog: false,
      selectedBlog: null,
      removeBlogDialog: false,
      imageUrl: "",
      blogId: null,
    };
  },
  async mounted() {
    let response = await axios.get(
      `http://localhost:3000/userBlogs/${this.$store.state.loggedInUserId}`
    );
    response.data.forEach((blog) => {
      this.AllBlogs.push(blog);
    });
  },

  methods: {
    setBlogId(blog) {
      this.selectedBlog = blog;
      this.blogId = blog.b_id;
    },
    showDeleteDialog(blog) {
      this.selectedBlog = blog;
      this.removeBlogDialog = true;
    },
    OpenEditDialog(blog) {
      this.selectedBlog = blog;
      this.openEditDialog = true;
    },
    async updateBlog() {
      const formData = new FormData();
      formData.append("title", this.selectedBlog.b_title);
      formData.append("author", this.selectedBlog.b_author);
      formData.append("description", this.selectedBlog.b_description);
      if (this.selectedBlog.b_picture instanceof File) {
        formData.append("image", this.selectedBlog.b_picture);
      }

      try {
        await axios.put(
          `http://localhost:3000/updateBlog/${this.selectedBlog.b_id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        this.openEditDialog = false;

        // Update the blog in the local AllBlogs array
        const index = this.AllBlogs.findIndex(
          (blog) => blog.b_id === this.selectedBlog.b_id
        );
        if (index !== -1) {
          this.AllBlogs.splice(index, 1, this.selectedBlog);
        }
      } catch (error) {
        console.error("Error updating blog:", error);
      }
    },
    async deleteBlog() {
      await axios.delete(
        `http://localhost:3000/deleteBlog/${this.selectedBlog.b_id}`
      );
      this.removeBlogDialog = false;

      // index is the start index from which elements will be removed. It was determined in the previous step using findIndex.
      // 1 is the number of elements to remove starting from the index.
      const index = this.AllBlogs.findIndex((blog) => {
        blog.b_id === this.selectedBlog.b_id;
      });
      this.AllBlogs.splice(index, 1);
    },

    handleFileChange(event) {
      const file = event.target.files[0];
      if (file && file instanceof File) {
        this.selectedBlog.b_picture = file;
        this.imageUrl = URL.createObjectURL(file);
      } else {
        this.imageUrl = "";
      }
    },
    truncateText(text, wordLimit) {
      const words = text.split(" ");
      if (words.length <= wordLimit) {
        return text;
      }
      return words.slice(0, wordLimit).join(" ") + " ...";
    },
  },
};
</script>

<style>
.image {
  height: 50%;
  width: 100%;
  border-radius: 5px;
  margin-left: 0px;
}
.blog-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.blog-card {
  height: 390px;
  width: calc(50% - 20px);
  margin-bottom: 20px;
  border-radius: 5px;
}
.blog-card:hover {
  box-shadow: 0 0 5px 2px rgb(173, 166, 166);
}

@media (min-width: 768px) {
  .blog-card {
    width: calc(33.33% - 20px); /* Adjust width as needed */
  }
}

@media (min-width: 1024px) {
  .blog-card {
    width: calc(25% - 20px); /* Adjust width as needed */
  }
}

.editButton {
  position: absolute;
  right: 11%;
  top: 2%;
  font-size: 20px;
}
.editButton:hover {
  cursor: pointer;
}

.deleteButton {
  position: absolute;
  right: 2%;
  top: 2%;
  font-size: 20px;
}
.deleteButton:hover {
  cursor: pointer;
}

.viewBlogButton {
  position: absolute;
  right: 7px;
  bottom: 7px;
}
</style>
