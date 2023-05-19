const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
    {
        fav: {
            type: Boolean,
            default: false,
        },
        name: {
            type: String,
            required: true,
        },
        timeToEat: {
            type: String,
            required: true
        },
        cusine: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true
        },
        time: {
            type: Number,
            required: true
        },
        quantityForServe: {
            type: Number,
            required: true
        },
        nutrientInfo: {
            type: Number,
            required: true
        },
        videoId: {
            type: String,
            required: true
        },
        ingredients: [{
            item: { type: String, required: true },
            quantity: { type: String, required: true },
            image: { type: String, required: true },
        }],
    },
    { timestamps: true }
)

const recipeModel = mongoose.model("recipe", recipeSchema);
module.exports = recipeModel;