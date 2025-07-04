const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  // age: {
  //   type: Number,
  //   required: true
  // },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  
  eyeColor:{
    type: String,
    required: true
  },

  skinTone: {
    type: String,
    required: true

  }, 
  hairColor: {
    type: String,
    required: true 
  },  

  hairStyle:{
    type: String, 
        required: true 

  },

  religion: {
    type: String,
        required: true 

  },
  birthdate: {
    type: Date,
    required: [true, 'Birthdate is required']
  },
  image: {
    type: String 
  },
  orphanage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Orphanage',
  },
  personality:{
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  slug: {
    type: String
    
  }
},
{
    timestamps: true,
}
);

const setImageURL = (doc) => {
  if (doc.image && !doc.image.startsWith('/upload/children/')) {
    doc.image = `/upload/children/${doc.image}`;
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
