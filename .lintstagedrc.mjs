export default {
  "src/**/*.ts?(x)": [
    () => "tsc --project tsconfig.json --alwaysStrict",
    "yarn test --watchAll=false --passWithNoTests --bail --findRelatedTests",
  ],
  "src/**/*.{js,jsx,ts,tsx,md,html,css}": [
    "prettier --write",
    "eslint --fix --max-warnings 0",
  ],
};
