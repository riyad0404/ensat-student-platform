export const anonymousSafety = (req, res, next) => {
  const currentUserId = req.user?.iduser;

  const anonymize = (post) => {
    if (
      post?.isAnonymat === true &&
      Number(post.iduser) !== Number(currentUserId)
    ) {
      if (post.auteur) {
        post.auteur.nom = "Anonyme";
        post.auteur.prenom = "";
        post.auteur.photo = null;
        delete post.auteur.iduser;
        delete post.auteur.niveau;
      }
    }
    return post;
  };

  // Cas liste
  if (Array.isArray(res.locals.data)) {
    res.locals.data = res.locals.data.map(anonymize);
  }

  // Cas post unique
  if (res.locals.data && !Array.isArray(res.locals.data)) {
    res.locals.data = anonymize(res.locals.data);
  }

  next();
};
