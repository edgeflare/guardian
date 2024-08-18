```shell
export NG_PROJECT_NAME=wg-webui
ng new --inline-style --prefix=e --routing --ssr=false --style=scss --standalone --strict $NG_PROJECT_NAME
cd $NG_PROJECT_NAME

ng generate environments
ng generate config karma

# tailwindcss
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
cat <<EOF > tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF
cat <<EOF >> src/styles.scss
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

# angular material
ng add @angular/material --skip-confirmation --theme=azure-blue --typography --animations=enabled

# eslint
ng add @angular-eslint/schematics --skip-confirmation
ng generate @angular-eslint/schematics:add-eslint-to-project $NG_PROJECT_NAME

# libraries
npm install oidc-client-ts @edgeflare/ng-oidc ace-builds ngx-mqtt hammerjs @capacitor/core vanilla-cookieconsent
npm i --save-dev @types/hammerjs

# shared internal library
ng generate library ng-essential --prefix=ng
```
