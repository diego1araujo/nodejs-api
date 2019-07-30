const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const PostSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title field is required'],
    },
    body: {
        type: String,
        required: [true, 'Body field is required'],
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

PostSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Post', PostSchema);