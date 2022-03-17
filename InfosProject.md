# Infos du projet

J'ai utilisé les versions identiques des packages à celles du tuto, donc si les libs ne sont pas à jour, c'est normal. J'ai privilégié la stabilité et le bon fonctionnement du projet aux prises de têtes avec les dernières versions touzolitoutbo

## Erreurs Serveurs

- Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client

| Dans ma route users.js, j'avais oublié de mettre un return dans les check d'erreurs de if(){}. A chaque fois que l'on fait un check de validation et que l'on veut que l'erreur renvoie un message à travers une response (ex : res.send()), il faut mettre un return dans le if sinon le code continue (même en cas d'erreur) son exécution jusqu'en bas où il peut rencontrer un second res.send().

```js
if (user) {
  return res.status(400).json({ errors: [{ msg: "User already exists" }] });
}
```

## populate, méthode mongoose

La méthode populate() permet de compléter les infos récupérées dans une collection quand une réf (un lien) est inclus dans le model.

Ex: Dans routes/api/profile.js

```js
// On va récupérer le profile qui correspond à l'id du user connecté. On populate (rajoute) les infos name et avatar venant du model "user". On peut populate parce que dans le modèle de Profile, on a inclus un lien vers le modèle cible (ici "user") (voir le modèle de Profile ligne 4)
const profile = await Profile.findOne({ user: req.user.id }).populate("user", [
  "name",
  "avatar",
]);
```

Dans models/Profile.js

```js
const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }
)}
```
