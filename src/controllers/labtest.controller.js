const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const Labtestsdump = require('../Microservices/Labtestsdump');

const fetchAllLabtests = catchAsync(async (req, res) => {
  const dataToFind = req.query.id;
  if (dataToFind == undefined) {
    const labdata = await Labtestsdump.Labtestsdump();
    res.status(httpStatus.OK).json(labdata);
  } else {
    const labdatabyid = await Labtestsdump.Labtestsdatabyid(dataToFind);
    if (labdatabyid == undefined) {
      res.status(httpStatus.BAD_REQUEST).json({ message: 'No Lab-Test Found with this ID' });
    }
    res.status(httpStatus.OK).json(labdatabyid);
  }
});

module.exports = {
  fetchAllLabtests,
};
