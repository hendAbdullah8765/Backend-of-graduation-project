const mongoose = require('mongoose');

const orphanageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  admin:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
 
  profileImg: {
    type: String 
  },
  slug: {
    type: String
  },

  phone: String,
  currentChildren:{
    type: Number
  },
  active:{
    type : Boolean,
    default: true
  },
location: String
}, 
{timestamps: true}
);

const setImageURL = (doc)=>{
  if(doc.PrfileImg){
    const imageUrl =`${process.env.BASE_URL}/orphanage/${doc.PrfileImg}`
    doc.PrfileImg = imageUrl;
  }
  if(doc.CoverImg){
    const imageUrl =`${process.env.BASE_URL}/orphanage/${doc.CoverImg}`
    doc.CoverImg = imageUrl;
  }
}
// getAll / update / getOne
orphanageSchema.post('init', (doc) => {
  setImageURL(doc)
});

//create
orphanageSchema.post('save', (doc) => {
  setImageURL(doc)
});

module.exports = mongoose.model('Orphanage', orphanageSchema);
 