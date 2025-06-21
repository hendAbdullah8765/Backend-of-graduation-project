const mongoose = require("mongoose");

const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },

    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    message: { type: String, trim: true },

    image: { type: String }, // اختياري لو عايزة تبعتي صورة

    isSeen: { type: Boolean, default: false },

    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);
const setImageURL = (doc)=>{
  if(doc.image){
    const imageUrl =`${process.env.BASE_URL}/upload/message/${doc.image}`
    doc.image = imageUrl;
  }
}
// getAll / update / getOne
messageSchema.post('init', (doc) => {
  setImageURL(doc)
});

//create
messageSchema.post('save', (doc) => {
  setImageURL(doc)
});

module.exports = mongoose.model("Message", messageSchema);
