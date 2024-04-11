const bcrypt = require('bcryptjs')
const { generateToken } = require('../utils/auth.util')

const user = require('../models/user.model' )

const signup = async (req, res) => {
    const { userName, password } = req.body
    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const sameUsername = await user.findOne({username: userName})
        if (sameUsername) {
            return res.status(400).json({ message: "userName already taken" })
        }

        await user.create({
            username : userName,
            password: hashedPassword
        })
        res.status(200).json({ message : 'Account created Successfully'})

    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message })
    }
}

const getKey = async (req, res) => {
    const { userName, password } = req.body
    try {
        const User = await user.findOne({ username : userName })
        if (!User) {
            return res.status(404).json({ message: "User not found" })
        }

        const validPassword = await bcrypt.compare(password, User.password)
        if (!validPassword) {
            return res.status(400).json({ message: "Wrong password" })
        }

        const currtoken = generateToken(User._id)

        res.status(200).json({ message: "logged in", token: currtoken })

    } catch (error) {
        console.log(error);
        res.status(400).json({ errorMessage: error.message })
    }
}

module.exports = { signup, getKey }