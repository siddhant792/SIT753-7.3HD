const multer = require('multer')
const path = require('path')
const fs = require('fs').promises
const { v4: uuidv4 } = require('uuid')
const { ValidationError } = require('../utils/errors')
const logger = require('../utils/logger')


const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads')
    try {
      await fs.mkdir(uploadDir, { recursive: true })
      cb(null, uploadDir)
    } catch (error) {
      cb(error)
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})


const fileFilter = (req, file, cb) => {
  
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new ValidationError('Invalid file type'), false)
  }
}


const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, 
    files: 5 
  }
})


const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ValidationError('File size too large. Maximum size is 5MB'))
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(new ValidationError('Too many files. Maximum is 5 files'))
    }
    return next(new ValidationError(err.message))
  }
  next(err)
}


const deleteFile = async (filename) => {
  try {
    const filepath = path.join(__dirname, '../../uploads', filename)
    await fs.unlink(filepath)
    logger.info(`File deleted: ${filename}`)
  } catch (error) {
    logger.error(`Error deleting file ${filename}:`, error)
    throw error
  }
}


const getFileUrl = (filename) => {
  return `${process.env.API_URL}/uploads/${filename}`
}

module.exports = {
  upload,
  handleMulterError,
  deleteFile,
  getFileUrl
} 