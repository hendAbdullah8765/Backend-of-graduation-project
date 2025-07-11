const axios = require('axios');
const asyncHandler = require('express-async-handler')
const ApiError = require('../utils/ApiError')

exports.smartSearch = asyncHandler(async (req, res, next) => {
  const query = req.body.query;

  if (!query) {
    return next(new ApiError("Query is required", 400));
  }

  try {
    const aiRes = await axios.post('http://127.0.0.1:5000/smart-search', {
      query,
    });

    const results = aiRes.data.results;

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error(error.message);
    return next(new ApiError("AI Service Failed", 500));
  }
});
