const dotenv = require('dotenv');
// eslint-disable-next-line object-curly-newline
const { Trash, Pictures, Cities, Users } = require('../../associations/index');

dotenv.config();
const getTrashDetail = async (request, h) => {
  const { id } = request.params;

  try {
    const trash = await Trash.findOne({
      where: {
        trash_id: id,
        is_verified: 1,
        user_finisher_id: 0,
        is_deleted: 0,
      },
      include: [
        {
          model: Pictures,
          as: 'pictures',
          attributes: ['image_path'],
        },
        {
          model: Cities,
          as: 'cities',
          attributes: ['name'],
        },
        {
          model: Users,
          as: 'users',
          attributes: ['full_name', 'user_id'],
        },
      ],
    });

    // Check if trash not found
    if (!trash) {
      return h
        .response({
          status: 'fail',
          message: 'trash not found',
        })
        .code(404);
    }

    // Check if trash is deleted
    if (trash.is_deleted === 1) {
      return h.response({
        status: 'fail',
        message: 'trash is deleted',
      });
    }

    // Result if trash found
    let serverHostURL = `${process.env.SERVER_HOST}`;
    if (process.env.SERVER_HOST === 'localhost') {
      serverHostURL += `:${process.env.SERVER_PORT}`;
    }

    const results = {
      id: trash.trash_id,
      title: trash.title,
      description: trash.description,
      city: trash.cities.name,
      address: trash.address,
      location_url: trash.location_url,
      uploader_id: trash.users.user_id,
      uploader_name: trash.users.full_name,
      pictures: trash.pictures.map(
        (picture) => `${serverHostURL}${picture.image_path}`,
      ),
    };

    return h
      .response({
        status: 'success',
        message: 'success GET detail',
        results,
      })
      .code(200);
  } catch (error) {
    return h
      .response({
        status: 'fail',
        message: 'something wrong',
        error: error.message,
      })
      .code(500);
  }
};

module.exports = getTrashDetail;
