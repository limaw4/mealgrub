import { Rating } from '@/models/Rating';
import { Recipe } from '@/models/Recipe';
import { mongooseConnect } from '@/lib/mongoose';

mongooseConnect();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userId, recipeId, value } = req.body;

  try {
    // Check if the user already rated the recipe
    const existingRating = await Rating.findOne({ user: userId, recipe: recipeId });

    if (existingRating) {
      // If the user already rated, update the existing rating
      existingRating.value = value;
      await existingRating.save();
    } else {
      // If the user hasn't rated yet, create a new rating
      const newRating = new Rating({ user: userId, recipe: recipeId, value });
      await newRating.save();
    }

    // Fetch and calculate the new average rating
    const ratings = await Rating.find({ recipe: recipeId });
    const totalRating = ratings.reduce((sum, rating) => sum + rating.value, 0);
    const newAverageRating = totalRating / ratings.length;

    // Update the recipe's average rating
    const updatedRecipe = await Recipe.findOneAndUpdate(
      { _id: recipeId },
      { $set: { averageRating: newAverageRating } },
      { new: true }
    );

    return res.status(200).json({ message: 'Recipe rated successfully', averageRating: updatedRecipe.averageRating });
  } catch (error) {
    console.error('Error rating recipe:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
