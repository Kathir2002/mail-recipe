const recipeModel = require("../models/recipe.model")

const recipeController = {
    addRecipe: async (req, res) => {
        let { name, timeToEat, cusine, category, image, time, quantityForServe, nutrientInfo, videoId } = req.body
        if (!name || !timeToEat || !cusine || !category || !image || !time || !quantityForServe || !nutrientInfo || !videoId) {
            return res.json({ error: "Please add all the required fields" })
        }
        else {
            const recipe = new recipeModel({
                name, timeToEat, cusine, category, image, time, quantityForServe, nutrientInfo, videoId
            })
            recipe.save()
                .then((data) => res.json({ data }))
                .catch((err) => res.json({ err }))
        }
    },
    addIngredients: async (req, res) => {
        const { ingredients, rId } = req.body;

        if (!ingredients || !rId) {
            return res.json({ error: "Please add all the required fields" })
        }
        else {
            if (Array.isArray(ingredients)) {
                ingredients.map(ingredient => {
                    let { item, quantity, image } = ingredient
                    let items = recipeModel.findByIdAndUpdate(rId, {
                        $push: {
                            ingredients: {
                                item,
                                quantity,
                                image
                            },
                        },
                    })
                        .then((data) => res.json({ data }))
                        .catch((err) => res.json({ err }))
                })
            }
        }
    },
    getRecipe: async (req, res) => {
        let recipes = recipeModel.find({})
            .then((data) => res.json({ data }))
            .catch((err) => res.json({ err }))
    }
}

module.exports = recipeController


