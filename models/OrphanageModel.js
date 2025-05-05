const mongoose = require('mongoose');

const orphanageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  adminName: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: true,
  },

  slug: {
    type: String
  },
 
  currentChildren: {
    type: Number,
    required: [true, 'Number of children is required'],
    min: 0
  },
  totalCapacity: {
    type: Number,
    required: [true, 'Total capacity is required'],
    min: 1
  },
  active:{
    type : Boolean,
    default: true
  },
  staffCount: {
    type: Number,
    required: [true, 'Staff count is required'],
    min: 0
  },
  establishedDate: {
    type: Date,
    required: [true, 'Established date is required']
  },
  phone: String,
  birthdate: {
    type: Date,
    required: [true, 'Birthdate is required']
  },

  workSchedule: {
    workDays: {
      type: [String], 
      enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      default: []
    },
  workHours: {
      type: [String], 
      enum: ['Morning 6am-12pm', 'Afternoon 12pm-4pm', 'Evening 4pm-8pm', 'Night 8pm-12am'],
      default: []
    },

  }
}, 
{timestamps: true}
);

const setImageURL = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/users/${doc.image}`;
    doc.image = imageUrl;
  }
};
// getAll / update / getOne
orphanageSchema.post("init", (doc) => {
  setImageURL(doc);
});
//create
orphanageSchema.post("save", (doc) => {
  setImageURL(doc);
});

module.exports = mongoose.model('Orphanage', orphanageSchema);
 
