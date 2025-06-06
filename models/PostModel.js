const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
{
    content: {
         type: String,
         required: true,
         minLength:[1,'Too Short Post content'],
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
    images:{
      type: [String],
      default: []},


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

const setImageURL = (doc)=>{
  if(doc.image){
    const imageUrl =`${process.env.BASE_URL}/posts/${doc.image}`
    doc.image = imageUrl;
  }
  if(doc.images){
    const imagesList = []
    doc.images.forEach((img) =>{
      const imageUrl =`${process.env.BASE_URL}/posts/${img}`
      imagesList.push(imageUrl)
    }) 
    doc.images = imagesList;
  }
}

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
