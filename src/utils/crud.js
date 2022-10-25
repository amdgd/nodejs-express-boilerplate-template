import ErrorResponse from './errorResponse'
import asyncHandler from '../middlewares/async'

export const getOne = (model, pop, popSelect) =>
  asyncHandler(async (req, res, next) => {
    //  Creating populateObject for populate
    let populateObject = {}
    if (pop === null) populateObject = null
    else populateObject = { path: pop, select: popSelect }

    const doc = await model
      .findOne({ _id: req.params.id })
      .lean()
      .populate(populateObject)
      .exec()

    //  if no documents were found, but Id was a Mongoose ObjectId
    if (!doc) {
      return next(
        new ErrorResponse(
          'No Documents found',
          400,
          'ObjectId seems ok, but no documents were found'
        )
      )
    } else res.status(200).json({ success: true, data: doc })
  })

export const getMany = (model, pop, popSelect) =>
  asyncHandler(async (req, res, next) => {
    //  Creating populateObject for populate
    let populateObject = {}
    if (pop === null) populateObject = null
    else populateObject = { path: pop, select: popSelect }

    // Copy req.query
    const reqQuery = { ...req.query, ...req.params }
    const pagination = {}
    let limit = 10
    let page = 1

    const estimatedDocumentCount = await model.estimatedDocumentCount()

    // Field sto Exclude
    const removeFields = ['select', 'sort', 'limit', 'offset', 'page']
    removeFields.forEach(params => delete reqQuery[params])

    // Create queryString
    let queryStr = JSON.stringify(reqQuery)

    //  Create Operators $gt, $gte, etc
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|eq|neq|in)\b/g,
      match => `$${match}`
    )

    // Createing Mongodb query
    let query = model.find(JSON.parse(queryStr))

    //  Limit Fields
    if (req.query.limit) {
      limit = parseInt(req.query.limit, 10)
      query = query.limit(limit)
    }

    const totalPages = Math.ceil(estimatedDocumentCount / limit)

    //  Sort Fields
    if (req.query.sort) {
      query = query.sort(req.query.sort)
    }

    //  Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ')
      query = query.select(fields)
    }

    //  Pagination
    if (req.query.page) {
      const page = parseInt(req.query.page, 10) || 1
      const startIndex = (page - 1) * limit
      query = query.skip(startIndex).limit(limit)
      if (page > 1) pagination.previousPage = page - 1
      if (page < totalPages) pagination.nextPage = page + 1
    }

    //  Execute query MongoDB
    const docs = await query
      .lean()
      .populate(populateObject)
      .exec()

    res.status(200).json({
      success: true,
      count: docs.length,
      currentPage: page,
      totalPages: totalPages,
      pagination: pagination,
      data: docs
    })
  })

export const createOne = model =>
  asyncHandler(async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
      return next(
        new ErrorResponse('No fields received for creation', 400, null)
      )
    }
    const doc = await model.create(req.body)
    res.status(201).json({ success: true, data: doc })
  })

export const updateOne = model =>
  asyncHandler(async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
      return next(
        new ErrorResponse('No fields received for updation', 400, null)
      )
    }

    const updatedDoc = await model
      .findOneAndUpdate(
        {
          _id: req.params.id
        },
        req.body,
        { new: true, runValidators: true }
      )
      .lean()
      .exec()

    if (!updatedDoc) {
      const message = 'No Document found for update'
      return next(new ErrorResponse(message, 404, null))
    }

    res.status(200).json({ success: true, data: updatedDoc })
  })

export const deleteOne = model =>
  asyncHandler(async (req, res, next) => {
    const doc = await model.findById(req.params.id)

    if (!doc) {
      const message = 'BAD request'
      return next(new ErrorResponse(message, 404, null))
    }
    doc.remove()

    return res.status(200).json({ success: true, data: doc })
  })

export const crudControllers = (model, pop = null, popSelect = null) => ({
  deleteOne: deleteOne(model),
  updateOne: updateOne(model),
  getMany: getMany(model, pop, popSelect),
  getOne: getOne(model, pop, popSelect),
  createOne: createOne(model)
})
