import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category is required"],
      unique: [true, "Category must be unique"],
      minLength: [2, "Too short category name"],
      maxLength: [32, "Too long category name"],
    },
    // slug: A and B ==> Shopping.com/a-and-b
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  { timestamps: true }
);

const setImageURL = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/brands/${doc.image}`;
    doc.image = imageUrl;
  }
};
// getOne , deleteOne , getAll ,updateOne
brandSchema.post("init", (doc) => {
  setImageURL(doc);
});
// createOne
brandSchema.post("save", (doc) => {
  setImageURL(doc);
});

const BrandModel = mongoose.model("Brand", brandSchema);

export default BrandModel;
