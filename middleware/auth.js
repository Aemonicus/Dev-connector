const jwt = require('jsonwebtoken');
const config = require('config');


module.exports = function (req, res, next) {
  //  Get token from header
  // const token = req.headers.authorization.split(" ")[ 1 ];
  const token = req.header('x-auth-token');


  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: "No token, autorization denied" });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));

    // On a les infos du user dans le payload du token (id dans notre cas, voir à la création/login du user) et on les pose dans un objet user de la requête
    req.user = decoded.user;

    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
    console.error(err.message);
  }

}