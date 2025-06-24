const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: false,
      // minLength: [1, 'Too Short Post content'],
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    image: {
      type: String,
      required: false
    },

    images: {
      type: [String],
      default: []
    },


    slug: {
      type: String

    },
    repostedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: null,
    },
    repostCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const setImageURL = (doc) => {
  if (doc.image && !doc.image.startsWith("/upload/posts/")) {
    doc.image = `/upload/posts/${doc.image}`;
  }

  if (doc.images && doc.images.length) {
    doc.images = doc.images.map((img) =>
      img.startsWith("/upload/posts/") ? img : `/upload/posts/${img}`
    );
  }
};


// getAll / update / getOne
PostSchema.post('init', (doc) => {
  setImageURL(doc)
});

//create
PostSchema.post('save', (doc) => {
  setImageURL(doc)
});
const Post = mongoose.model('Post', PostSchema);
module.exports = Post;
