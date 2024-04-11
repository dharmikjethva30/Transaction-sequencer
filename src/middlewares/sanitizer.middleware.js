const mongoSanitizer = require('express-mongo-sanitize')

module.exports = mongoSanitizer({
	allowDots: true,
	onSanitize: ({ req, key }) => {
        console.warn(`This request[${req.originalUrl}] is sanitized, because it contains forbidden character: ${key}`)

        throw new Error(`This request[${req.originalUrl}] is sanitized, because it contains forbidden character: ${key}`)
	}
})