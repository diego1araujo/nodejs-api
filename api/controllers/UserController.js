const faker = require('faker');

const User = require('../models/User');

module.exports = {
    index: async (req, res) => {
        const { page = 1, limit = 10 } = req.query;

        const options = {
            select: '_id email created_at',
            sort: { created_at: -1 },
            page,
            limit,
        };

        try {
            const users = await User.paginate({}, options);

            return res.status(200).json({
                total: users.totalDocs,
                limit: users.limit,
                page: users.page,
                pages: users.totalPages,
                data: users.docs.map(user => ({
                    _id: user._id,
                    email: user.email,
                    created_at: user.created_at,
                    request: {
                        url: `/users/${user._id}`,
                    },
                })),
            });
        } catch (error) {
            return res.status(500).json({
                error,
            });
        }
    },

    store: async (req, res) => {
        const { email, password, password_confirmation } = req.body;

        req.checkBody('email')
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Email is invalid');

        req.checkBody('password')
            .notEmpty()
            .withMessage('Password is required')
            .isLength({ min: 5 })
            .withMessage('Password requires at least 5 characters')
            .equals(password_confirmation)
            .withMessage('Passwords must match');

        req.checkBody('password_confirmation')
            .notEmpty()
            .withMessage('Password Confirmation is required');

        const errors = req.validationErrors();

        if (errors) {
            return res.status(500).json({
                errors,
            });
        }

        try {
            const userExists = await User.find({ email });

            if (userExists.length > 0) {
                return res.status(409).json({
                    message: 'Email already exists',
                });
            }

            const user = await User.create(req.body);

            return res.status(201).json({
                message: 'User created successfully',
                data: {
                    _id: user._id,
                    email: user.email,
                    request: {
                        url: `/users/${user._id}`,
                    },
                },
            });
        } catch (error) {
            return res.status(500).json({
                error,
            });
        }
    },

    show: async (req, res) => {
        try {
            const user = await User.findById(req.params.id).select('_id email created_at');

            return res.status(200).json(user);
        } catch (error) {
            return res.status(500).json({
                error,
            });
        }
    },

    destroy: async (req, res) => {
        try {
            await User.deleteOne({ _id: req.params.id });

            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({
                error,
            });
        }
    },

    generateSeed: async () => {
        const fakeUsers = [];

        // Dummy some fake data
        for (let i = 0; i < 5; i += 1) {
            const saveUser = await User.create({
                email: faker.internet.email().toLowerCase(),
                password: 'secret',
            });

            fakeUsers.push(saveUser);
        }

        return fakeUsers;
    },

    seed: async (req, res) => {
        await module.exports.generateSeed();

        return res.status(200).json({
            message: 'User database seeded successfully',
        });
    },
};