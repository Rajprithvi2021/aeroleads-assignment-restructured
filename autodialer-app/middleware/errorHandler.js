module.exports = (err, req, res, next) => {
  console.log('Custom error handler reached');
  console.error('Error:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err, stack: err.stack })
  });
};
