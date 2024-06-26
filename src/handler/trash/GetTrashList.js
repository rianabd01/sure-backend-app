const { Op } = require('sequelize');
const dotenv = require('dotenv');
const { Trash, Pictures, Cities } = require('../../associations/index');
// const sequelize = require('../../sequelize');

dotenv.config();
const getTrashList = async (request, h) => {
  const { location, page = 1, datesort = 'desc' } = request.query;

  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    const trashList = await Trash.findAll({
      include: [
        {
          model: Cities,
          as: 'cities',
          attributes: ['name'],
          where: location ? { name: { [Op.like]: `%${location}%` } } : {},
        },
        {
          model: Pictures,
          as: 'pictures',
          attributes: ['image_path'],
        },
      ],
      where: {
        is_verified: 1,
        user_finisher_id: 0,
        is_deleted: 0,
      },
      order: [['created_at', datesort]],

      limit,
      offset,
    });

    // Check if trash list not found
    if (!trashList || trashList.length === 0) {
      return h
        .response({
          status: 'fail',
          message: 'trash list is not found',
        })
        .code(404);
    }

    // Result if trash found
    let serverHostURL = `${process.env.SERVER_HOST}`;
    if (process.env.SERVER_HOST === 'localhost') {
      serverHostURL += `:${process.env.SERVER_PORT}`;
    }

    const results = trashList.map((trash) => ({
      id: trash.trash_id,
      title: trash.title,
      description: trash.description,
      city: trash.cities.name,
      pictures:
        trash.pictures.length > 0
          ? serverHostURL + trash.pictures[0].image_path
          : null,
    }));

    return h
      .response({
        status: 'success',
        message: 'success GET trash list',
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

module.exports = getTrashList;
