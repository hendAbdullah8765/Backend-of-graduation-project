const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');
const ApiFeatures = require('../utils/ApiFeatures ');

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }
    res.status(204).send();
  });

exports.updateOne = (Model, populateOptions) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
   
    if (!document) {
      return next(
        new ApiError(`No document for this id ${req.params.id}`, 404)
      );
    }

    if (populateOptions) {
      await document.populate(populateOptions);
    }

    res.status(200).json({ data: document });
  });


exports.createOne = (Model, populateOptions) =>
  asyncHandler(async (req, res) => {
    const newDoc = await Model.create(req.body);

    if (populateOptions) {
      await newDoc.populate(populateOptions);
    }

    res.status(201).json({ data: newDoc });
  });

exports.getOne = (Model, populateOptions) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    let query = Model.findById(id);
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    const document = await query;

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }

    res.status(200).json({ data: document });
  });


// eslint-disable-next-line default-param-last
exports.getAll = (Model, modelName = '', populateOptions) =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }

    const query = Model.find(filter).sort({ createdAt: -1 });

    const apiFeatures = new ApiFeatures(query, req.query)
      .search(modelName)
      .filter()
      .limitFields();

    let { mongooseQuery } = apiFeatures;

    if (populateOptions) {
      mongooseQuery = mongooseQuery.populate(populateOptions);
    }

    const documents = await mongooseQuery;

    res.status(200).json({
      results: documents.length,
      data: documents,
    });
  });

