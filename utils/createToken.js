const jwt =require ('jsonwebtoken');

const GenerateToken = (payload) => 
   jwt.sign({userId : payload }, process.env.JWT_SECRET_KEY,
    {expiresIn: process.env.JWT_EXPIRE_TIME }
  );
 module.exports = GenerateToken;