import asyncHandler from "express-async-handler";
import AppError from "../utils/appError.js";
import { ApiFeatures } from "../utils/apiFeatures.js";

export const deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);
    if (!document) {
      return next(new AppError(`document not found ${id}`, 404));
    }
    // Trigger "remove" event when update decument
    document.deleteOne();
    res.status(200).send();
  });

export const updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!document) {
      return next(new AppError(`document not found ${req.params.id}`, 404));
    }
    // Trigger "save" event when update decument
    document.save();
    res.status(200).json({ data: document });
  });

export const createDocument = (Model) =>
  asyncHandler(async (req, res) => {
    const document = await Model.create(req.body);
    res.status(201).json({ data: document });
  });

export const getOne = (Model, populateOpt) =>
  asyncHandler(async (req, res, next) => {
    // 1) Build query
    let query = Model.findById(req.params.id);
    if (populateOpt) {
      query = query.populate(populateOpt);
    }
    // 2) Execute query
    const document = await query;
    if (!document) {
      return next(new AppError(`document not found ${req.params.id}`, 404));
    }
    res.status(200).json({ data: document });
  });

export const getAll = (Model, modelName = "") =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }
    const documentCounts = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .search(modelName)
      .paginate(documentCounts)
      .filter()
      .sort()
      .limitFields();
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;
    res
      .status(200)
      .json({ results: documents.length, paginationResult, data: documents });
  });
