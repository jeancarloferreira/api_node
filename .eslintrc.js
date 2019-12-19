module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-base',
    'prettier',
  ],
  plugins: ['prettier'],

  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules:  {
    //retornar erro para nós
    "prettier/prettier": "error",
    //não usar o this. na classe
    "class-methods-use-this": "off",
    //quando receber um valor de parametro poder modificar ela
    "no-param-reassign": "off",
    //desabilitar o padrão da declaração da variável exemplo deVar
    "camelcase": "off",
    //abrir exeção para declarar a variável NEXT sem utilizar
    "no-unused-vars": ["error", {"argsIgnorePattern": "next" }],
  },
};
