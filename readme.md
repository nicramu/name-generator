# polish fancy name generator
node.js backend + react frontend

https://146.59.14.8:5000

it generates random name based on pattern: adverb + adjective + noun from random wiktionary pages (like: https://pl.wiktionary.org/wiki/Special:RandomInCategory?wpcategory=Kategoria%3AJęzyk_polski_-_przymiotniki)

- separator query "?separator=-", ex. "pędzący duży kot" / "pędzący-duży-kot"
- multiple results query "&count=2", max 20
- dark and light theme
- fav button to persist name in list
- share button to share generated name (html canvas image) // (HTTPS only ~~, go to port X+1 to accept self signed certificate also for backend~~)
- save button to save generated image
- TODO: frequency list from wiktionary could be used to generate less random data
- TODO: theme-color in index.html changes out of bounds on iOS Safari