const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  EducationalLevel:{
    type: String,
    required: true
  },

  skinColor: {
    type: String,
    required: true

  }, 
  hairColor: {
    type: String, 
    enum: ['black', 'brown', 'blonde', 'red', 'gray'],
  },  

  hairStyle:{
    type: String, 
    enum:['curly','wavy','straight']
  },

  religion: {
    type: String,
    enum: ['Muslim', 'Christian']
  },
  image: {
    type: String 
  },
  orphanage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Orphanage',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  slug: {
    type: String
    
  }
});

const setImageURL = (doc)=>{
  if(doc.image){
    const imageUrl =`${process.env.BASE_URL}/children/${doc.image}`
    doc.image = imageUrl;
  }
}
// getAll / update / getOne
childSchema.post('init', (doc) => {
  setImageURL(doc)
});

//create
childSchema.post('save', (doc) => {
  setImageURL(doc)
});

module.exports = mongoose.model('Child', childSchema);
