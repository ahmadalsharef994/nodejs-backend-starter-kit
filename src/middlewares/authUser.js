const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');
const checkBanned = require('../utils/CheckBanned');

const authuser = () => async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    const bearer = header.split(' ');
    const token = bearer[1];
    const secret = config.jwt.secret;
    const payload = jwt.verify(token, secret);
    const subid = payload.sub;
    const subidrole = payload.role;
    req.SubjectId = subid;
    const bancheck = await checkBanned(subid);
    if(bancheck.isbanned == true){
      res.status(401).json('You are Banned please reach support');
    }else if(!bancheck.role.includes("user") || subidrole != "user"){
      res.status(401).json('You dont have Access to these resources');
    }else{
      next();
    }
  } catch (error) { 
    res.status(400).json('Invalid Request!');
  };
  };

module.exports = authuser;
