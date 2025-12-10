import jwt from 'jsonwebtoken';


const createAccessToken = (user) => {
  return jwt.sign(
    {
      iduser: user.iduser,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      niveau: user.niveau,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
    }
  );
};


const createRefreshToken = (user) => {
  return jwt.sign(
    {
      iduser: user.iduser,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    }
  );
};


export const generateTokens = (user) => {
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  return { accessToken, refreshToken };
};


export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};
